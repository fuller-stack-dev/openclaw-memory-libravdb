## Proto generation — run from repo root
##   make proto
GOPATH := $(shell /opt/homebrew/bin/go env GOPATH)
PROTOC := /opt/homebrew/bin/protoc
PROTO_SRC := api/proto/intelligence_kernel/v1/kernel.proto
PROTO_INC := /opt/homebrew/include

.PHONY: proto
proto:
	$(PROTOC) \
		--plugin=protoc-gen-go=$(GOPATH)/bin/protoc-gen-go \
		--plugin=protoc-gen-go-grpc=$(GOPATH)/bin/protoc-gen-go-grpc \
		--proto_path=. \
		--proto_path=$(PROTO_INC) \
		--go_out=sidecar \
		--go_opt=paths=source_relative \
		--go-grpc_out=sidecar \
		--go-grpc_opt=paths=source_relative \
		$(PROTO_SRC)
	@echo "Proto generated: sidecar/api/proto/intelligence_kernel/v1/"
