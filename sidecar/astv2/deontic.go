package astv2

type ModalityMask uint8

const (
	ModalityNone       ModalityMask = 0
	ModalityObligation ModalityMask = 1 << iota
	ModalityForbidden
	ModalityPermitted
)

type ModalityToken struct {
	Start int
	End   int
	Mask  ModalityMask
}

type DeonticFrame struct{}

type Evaluation struct {
	Promoted bool
	Mask     ModalityMask
	Tokens   []ModalityToken
}

func NewDeonticFrame() *DeonticFrame {
	return &DeonticFrame{}
}

func (f *DeonticFrame) EvaluateText(raw []byte) Evaluation {
	tokens := ScanAll(raw)
	mask := ExtractModalityMask(tokens)
	return Evaluation{
		Promoted: mask != ModalityNone,
		Mask:     mask,
		Tokens:   tokens,
	}
}

func ScanModalitySet(raw []byte) []ModalityToken {
	return ScanAll(raw)
}

func HasObligation(raw []byte) bool {
	return ExtractModalityMask(ScanAll(raw))&ModalityObligation != 0
}

func ExtractModalityMask(tokens []ModalityToken) ModalityMask {
	var mask ModalityMask
	for _, token := range tokens {
		mask |= token.Mask
	}
	return mask
}

func ScanAll(raw []byte) []ModalityToken {
	tokens := make([]ModalityToken, 0, 4)
	lastYouWord := -1000
	wordIndex := 0

	forEachWord(raw, func(start, end int) bool {
		switch {
		case equalWord(raw, start, end, "you"):
			lastYouWord = wordIndex
		case wordIndex-lastYouWord <= 3:
			if mask, ok := detectModal(raw, start, end); ok {
				tokens = append(tokens, ModalityToken{Start: start, End: end, Mask: mask})
			}
		}
		wordIndex++
		return true
	})

	return tokens
}

func detectModal(raw []byte, start, end int) (ModalityMask, bool) {
	switch {
	case equalWord(raw, start, end, "must"), equalWord(raw, start, end, "shall"), equalWord(raw, start, end, "required"):
		if nextWordEquals(raw, end, "not") {
			return ModalityForbidden, true
		}
		return ModalityObligation, true
	case equalWord(raw, start, end, "should"):
		return ModalityObligation, true
	case equalWord(raw, start, end, "may"):
		if nextWordEquals(raw, end, "not") {
			return ModalityForbidden, true
		}
		return ModalityPermitted, true
	case equalWord(raw, start, end, "never"), equalWord(raw, start, end, "cannot"):
		return ModalityForbidden, true
	case equalWord(raw, start, end, "can"):
		if nextWordEquals(raw, end, "not") {
			return ModalityForbidden, true
		}
	}
	return ModalityNone, false
}

func nextWordEquals(raw []byte, pos int, want string) bool {
	found := false
	forEachWordFrom(raw, pos, func(start, end int) bool {
		found = equalWord(raw, start, end, want)
		return false
	})
	return found
}

func forEachWord(raw []byte, fn func(start, end int) bool) {
	forEachWordFrom(raw, 0, fn)
}

func forEachWordFrom(raw []byte, offset int, fn func(start, end int) bool) {
	inWord := false
	start := 0
	for i := offset; i < len(raw); i++ {
		if isWordByte(raw[i]) {
			if !inWord {
				start = i
				inWord = true
			}
			continue
		}
		if inWord {
			if !fn(start, i) {
				return
			}
			inWord = false
		}
	}
	if inWord {
		_ = fn(start, len(raw))
	}
}

func isWordByte(b byte) bool {
	return (b >= 'a' && b <= 'z') || (b >= 'A' && b <= 'Z')
}

func equalWord(raw []byte, start, end int, want string) bool {
	if end-start != len(want) {
		return false
	}
	for i := 0; i < len(want); i++ {
		if toLowerASCII(raw[start+i]) != want[i] {
			return false
		}
	}
	return true
}

func toLowerASCII(b byte) byte {
	if b >= 'A' && b <= 'Z' {
		return b + ('a' - 'A')
	}
	return b
}
