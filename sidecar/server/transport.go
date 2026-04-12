package server

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

var ErrServerClosed = errors.New("sidecar server closed")

type request struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      any             `json:"id"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
}

type response struct {
	JSONRPC string         `json:"jsonrpc"`
	ID      any            `json:"id,omitempty"`
	Result  any            `json:"result,omitempty"`
	Error   *responseError `json:"error,omitempty"`
}

type responseError struct {
	Message string `json:"message"`
}

func Listen(endpoint string) (net.Listener, string, func(), error) {
	trimmed := strings.TrimSpace(endpoint)
	switch {
	case strings.HasPrefix(trimmed, "tcp:"):
		address := strings.TrimPrefix(trimmed, "tcp:")
		listener, err := net.Listen("tcp", address)
		if err != nil {
			return nil, "", nil, err
		}
		return listener, "tcp:" + listener.Addr().String(), func() {
			_ = listener.Close()
		}, nil
	case strings.HasPrefix(trimmed, "unix:"):
		socketPath := strings.TrimPrefix(trimmed, "unix:")
		if socketPath == "" {
			return nil, "", nil, errors.New("unix endpoint requires a socket path")
		}
		if err := os.MkdirAll(filepath.Dir(socketPath), 0o755); err != nil {
			return nil, "", nil, err
		}
		_ = os.Remove(socketPath)
		listener, err := net.Listen("unix", socketPath)
		if err != nil {
			return nil, "", nil, err
		}
		return listener, "unix:" + socketPath, func() {
			_ = listener.Close()
			_ = os.Remove(socketPath)
		}, nil
	default:
		return nil, "", nil, fmt.Errorf("unsupported RPC endpoint %q; expected tcp:host:port or unix:/path/to/socket", endpoint)
	}
}

func Serve(ctx context.Context, listener net.Listener, srv *Server) error {
	if listener == nil {
		return errors.New("listener is required")
	}
	if srv == nil {
		return errors.New("server is required")
	}

	go func() {
		<-ctx.Done()
		_ = listener.Close()
	}()

	for {
		conn, err := listener.Accept()
		if err != nil {
			if ctx.Err() != nil || errors.Is(err, net.ErrClosed) {
				return ErrServerClosed
			}
			return err
		}
		go serveConn(ctx, conn, srv)
	}
}

func serveConn(ctx context.Context, conn net.Conn, srv *Server) {
	defer conn.Close()

	var writeMu sync.Mutex
	var wg sync.WaitGroup
	reader := bufio.NewReader(conn)
	for {
		select {
		case <-ctx.Done():
			wg.Wait()
			return
		default:
		}

		line, err := reader.ReadString('\n')
		if err != nil {
			if errors.Is(err, io.EOF) {
				wg.Wait()
				return
			}
			wg.Wait()
			return
		}

		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var req request
		if err := json.Unmarshal([]byte(line), &req); err != nil {
			writeMu.Lock()
			_ = writeResponse(conn, response{
				JSONRPC: "2.0",
				Error:   &responseError{Message: fmt.Sprintf("invalid request: %v", err)},
			})
			writeMu.Unlock()
			continue
		}

		var params any
		if len(req.Params) > 0 {
			if err := json.Unmarshal(req.Params, &params); err != nil {
				writeMu.Lock()
				_ = writeResponse(conn, response{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &responseError{Message: fmt.Sprintf("invalid params: %v", err)},
				})
				writeMu.Unlock()
				continue
			}
		}

		// Handle each RPC call concurrently. The plugin sends parallel RPCs
		// (Promise.all) during assembly. Previously these serialized through a
		// single goroutine, compounding full-scan latency across 5-8 searches.
		wg.Add(1)
		go func(req request, params any) {
			defer wg.Done()
			result, err := srv.Call(ctx, req.Method, params)

			writeMu.Lock()
			defer writeMu.Unlock()

			if err != nil {
				_ = writeResponse(conn, response{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &responseError{Message: err.Error()},
				})
				return
			}

			_ = writeResponse(conn, response{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  result,
			})
		}(req, params)
	}
}

func writeResponse(w io.Writer, resp response) error {
	data, err := json.Marshal(resp)
	if err != nil {
		return err
	}
	_, err = io.WriteString(w, string(data)+"\n")
	return err
}
