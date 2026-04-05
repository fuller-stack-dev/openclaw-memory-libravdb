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

type wordToken struct {
	Start int
	End   int
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
	words := scanWords(raw)
	lastYouWord := -1000
	// setupLeadInSeen tracks whether a setup/procedural lead-in phrase has been
	// encountered in the current sentence. Connective-based promotion only fires
	// after this is set true.
	setupLeadInSeen := false

	for wordIndex, word := range words {
		// Reset setup context only at true sentence boundaries (period, newline).
		// NOT at commas, colons, or semicolons — those are clause separators
		// within a sentence (e.g., "folder, run them" is still one sentence).
		if isPeriodBoundary(raw, word.Start) {
			setupLeadInSeen = false
		}
		switch {
		case equalWord(raw, word.Start, word.End, "you"):
			lastYouWord = wordIndex
			if isSentenceStart(raw, word.Start) {
				if token, ok := detectIdentityStyle(raw, words, wordIndex); ok {
					tokens = append(tokens, token)
				}
			}
		case wordIndex-lastYouWord <= 3:
			if mask, ok := detectModal(raw, word.Start, word.End); ok && !isNarrativeRhetoric(raw, words, wordIndex) {
				tokens = append(tokens, ModalityToken{Start: word.Start, End: word.End, Mask: mask})
			}
		}
		if isSentenceStart(raw, word.Start) {
			if token, ok := detectStructuralRule(raw, words, wordIndex); ok {
				tokens = append(tokens, token)
			}
			if token, ok := detectBareImperative(raw, words, wordIndex); ok {
				tokens = append(tokens, token)
			}
			if token, ok := detectScopedThirdPersonRule(raw, words, wordIndex); ok {
				tokens = append(tokens, token)
			}
		}
	// Catch imperatives buried after setup/instructional leading clauses.
	// e.g. "to get X running just make sure Y then run Z" — "run" is after "then".
	// e.g. "the tests are in folder,run them with..." — "run" is after comma.
	// e.g. "if you need to update X, check Y but don't..." — "check" is after comma, "change" is forbidden after "don't".
	if token, ok := detectSetupImperative(raw, words, wordIndex, setupLeadInSeen); ok {
			tokens = append(tokens, token)
		}
		// Mark setup lead-in so subsequent connective patterns can fire.
		// These phrases indicate procedural/setup context where connective-borne
		// directives are expected (e.g., "then run", "but make sure").
		if isSetupLeadInWord(raw, words, wordIndex) {
			setupLeadInSeen = true
		}
	}

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

func scanWords(raw []byte) []wordToken {
	words := make([]wordToken, 0, 16)
	forEachWord(raw, func(start, end int) bool {
		words = append(words, wordToken{Start: start, End: end})
		return true
	})
	return words
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

func isAllCapsWord(raw []byte, start, end int) bool {
	if end <= start {
		return false
	}
	for i := start; i < end; i++ {
		if raw[i] < 'A' || raw[i] > 'Z' {
			return false
		}
	}
	return true
}

func hasColonBetween(raw []byte, left, right wordToken) bool {
	for i := left.End; i < right.Start; i++ {
		if raw[i] == ':' {
			return true
		}
	}
	return false
}

func hasArrowBetween(raw []byte, left, right wordToken) bool {
	for i := left.End; i+1 < right.Start; i++ {
		if raw[i] == '-' && raw[i+1] == '>' {
			return true
		}
	}
	return false
}

func isSentenceStart(raw []byte, start int) bool {
	for i := start - 1; i >= 0; i-- {
		switch raw[i] {
		case ' ', '\t', '\r':
			continue
		case '\n', '.', '!', '?', ':', ';':
			return true
		default:
			return false
		}
	}
	return true
}

// isPeriodBoundary returns true only at a true sentence end (period or newline).
// It is stricter than isSentenceStart — commas and colons do NOT count as
// period boundaries. This prevents clause-internal punctuation (e.g., "folder,")
// from breaking setup-lead-in tracking within a single procedural sentence.
func isPeriodBoundary(raw []byte, start int) bool {
	for i := start - 1; i >= 0; i-- {
		switch raw[i] {
		case ' ', '\t', '\r':
			continue
		case '.', '\n':
			return true
		default:
			return false
		}
	}
	return true
}

func detectBareImperative(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	word := words[idx]
	switch {
	case equalWord(raw, word.Start, word.End, "always"):
		if next := idx + 1; next < len(words) && isImperativeVerb(raw, words[next].Start, words[next].End) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		}
	case equalWord(raw, word.Start, word.End, "default"):
		if token, ok := detectDefaultRequirement(raw, words, idx); ok {
			return token, true
		}
	case equalWord(raw, word.Start, word.End, "bid"):
		if token, ok := detectSentenceStartProhibitionPredicate(raw, words, idx); ok {
			return token, true
		}
	case equalWord(raw, word.Start, word.End, "please"):
		if next := idx + 1; next < len(words) && isImperativeVerb(raw, words[next].Start, words[next].End) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		}
	case equalWord(raw, word.Start, word.End, "strictly"):
		if next := idx + 1; next < len(words) && isImperativeVerb(raw, words[next].Start, words[next].End) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		}
	case equalWord(raw, word.Start, word.End, "do"):
		if idx+2 < len(words) && equalWord(raw, words[idx+1].Start, words[idx+1].End, "not") && isImperativeVerb(raw, words[idx+2].Start, words[idx+2].End) {
			return ModalityToken{Start: word.Start, End: words[idx+1].End, Mask: ModalityForbidden}, true
		}
	case equalWord(raw, word.Start, word.End, "never"):
		if next := idx + 1; next < len(words) && isImperativeVerb(raw, words[next].Start, words[next].End) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityForbidden}, true
		}
	case equalWord(raw, word.Start, word.End, "no"):
		if idx+1 < len(words) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityForbidden}, true
		}
	case equalWord(raw, word.Start, word.End, "don"):
		if idx+2 < len(words) &&
			equalWord(raw, words[idx+1].Start, words[idx+1].End, "t") &&
			equalWord(raw, words[idx+2].Start, words[idx+2].End, "forget") {
			return ModalityToken{Start: word.Start, End: words[idx+2].End, Mask: ModalityObligation}, true
		}
	case equalWord(raw, word.Start, word.End, "if"):
		if token, ok := detectConditionalGuidance(raw, words, idx); ok {
			return token, true
		}
	case isImperativeVerb(raw, word.Start, word.End):
		if isMetatextualImperativeContext(raw, words, idx) {
			return ModalityToken{}, false
		}
		return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
	}
	return ModalityToken{}, false
}

func detectSentenceStartProhibitionPredicate(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	for lookahead := idx + 1; lookahead < len(words) && lookahead <= idx+6; lookahead++ {
		if equalWord(raw, words[lookahead].Start, words[lookahead].End, "prohibited") ||
			equalWord(raw, words[lookahead].Start, words[lookahead].End, "forbidden") {
			return ModalityToken{Start: words[lookahead].Start, End: words[lookahead].End, Mask: ModalityForbidden}, true
		}
	}
	return ModalityToken{}, false
}

func detectDefaultRequirement(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	if idx+2 >= len(words) {
		return ModalityToken{}, false
	}
	if !equalWord(raw, words[idx].Start, words[idx].End, "default") ||
		!equalWord(raw, words[idx+1].Start, words[idx+1].End, "requirement") ||
		!hasColonBetween(raw, words[idx+1], words[idx+2]) {
		return ModalityToken{}, false
	}
	switch {
	case isImperativeVerb(raw, words[idx+2].Start, words[idx+2].End),
		equalWord(raw, words[idx+2].Start, words[idx+2].End, "ensure"),
		equalWord(raw, words[idx+2].Start, words[idx+2].End, "every"):
		return ModalityToken{Start: words[idx].Start, End: words[idx+1].End, Mask: ModalityObligation}, true
	default:
		return ModalityToken{}, false
	}
}

func detectStructuralRule(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	if token, ok := detectCommandLabelRule(raw, words, idx); ok {
		return token, true
	}
	if token, ok := detectManifestFieldRule(raw, words, idx); ok {
		return token, true
	}
	if token, ok := detectManifestArrowRule(raw, words, idx); ok {
		return token, true
	}
	if token, ok := detectQuantifiedRequirement(raw, words, idx); ok {
		return token, true
	}
	return ModalityToken{}, false
}

func detectCommandLabelRule(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	switch {
	case equalWord(raw, words[idx].Start, words[idx].End, "build"),
		equalWord(raw, words[idx].Start, words[idx].End, "test"),
		equalWord(raw, words[idx].Start, words[idx].End, "lint"),
		equalWord(raw, words[idx].Start, words[idx].End, "benchmarks"),
		equalWord(raw, words[idx].Start, words[idx].End, "production"),
		equalWord(raw, words[idx].Start, words[idx].End, "development"):
		if idx+1 < len(words) && hasColonBetween(raw, words[idx], words[idx+1]) {
			return ModalityToken{Start: words[idx].Start, End: words[idx].End, Mask: ModalityObligation}, true
		}
		if idx+2 < len(words) && hasColonBetween(raw, words[idx+1], words[idx+2]) {
			return ModalityToken{Start: words[idx].Start, End: words[idx+1].End, Mask: ModalityObligation}, true
		}
		return ModalityToken{}, false
	default:
		return ModalityToken{}, false
	}
}

func detectManifestFieldRule(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	if idx+2 >= len(words) || !hasColonBetween(raw, words[idx+1], words[idx+2]) {
		return ModalityToken{}, false
	}
	if !isAllCapsWord(raw, words[idx].Start, words[idx].End) || !isAllCapsWord(raw, words[idx+1].Start, words[idx+1].End) {
		return ModalityToken{}, false
	}
	if !isOperationalManifestField(raw, words[idx], words[idx+1]) {
		return ModalityToken{}, false
	}
	return ModalityToken{Start: words[idx].Start, End: words[idx+1].End, Mask: ModalityObligation}, true
}

func detectManifestArrowRule(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	for arrowLeft := idx + 1; arrowLeft < len(words) && arrowLeft <= idx+3; arrowLeft++ {
		arrowRight := arrowLeft + 1
		if arrowRight >= len(words) || !hasArrowBetween(raw, words[arrowLeft], words[arrowRight]) {
			continue
		}
		allCaps := true
		for i := idx; i <= arrowLeft; i++ {
			if !isAllCapsWord(raw, words[i].Start, words[i].End) {
				allCaps = false
				break
			}
		}
		if !allCaps || !equalWord(raw, words[idx].Start, words[idx].End, "on") {
			continue
		}
		return ModalityToken{Start: words[idx].Start, End: words[arrowLeft].End, Mask: ModalityObligation}, true
	}
	return ModalityToken{}, false
}

func detectQuantifiedRequirement(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	if !equalWord(raw, words[idx].Start, words[idx].End, "every") {
		return ModalityToken{}, false
	}
	for lookahead := idx + 1; lookahead < len(words) && lookahead <= idx+5; lookahead++ {
		switch {
		case equalWord(raw, words[lookahead].Start, words[lookahead].End, "must"),
			equalWord(raw, words[lookahead].Start, words[lookahead].End, "shall"),
			equalWord(raw, words[lookahead].Start, words[lookahead].End, "required"):
			return ModalityToken{Start: words[lookahead].Start, End: words[lookahead].End, Mask: ModalityObligation}, true
		case equalWord(raw, words[lookahead].Start, words[lookahead].End, "should"):
			return ModalityToken{Start: words[lookahead].Start, End: words[lookahead].End, Mask: ModalityObligation}, true
		}
	}
	return ModalityToken{}, false
}

func isOperationalManifestField(raw []byte, first, second wordToken) bool {
	switch {
	case equalWord(raw, first.Start, first.End, "alloc") && equalWord(raw, second.Start, second.End, "strategy"):
		return true
	case equalWord(raw, first.Start, first.End, "concurrency") && equalWord(raw, second.Start, second.End, "model"):
		return true
	case equalWord(raw, first.Start, first.End, "performance") && equalWord(raw, second.Start, second.End, "target"):
		return true
	case equalWord(raw, first.Start, first.End, "anti") && equalWord(raw, second.Start, second.End, "vm"):
		return true
	case equalWord(raw, first.Start, first.End, "sandbox") && equalWord(raw, second.Start, second.End, "aware"):
		return true
	case equalWord(raw, first.Start, first.End, "ebpf") && equalWord(raw, second.Start, second.End, "monitoring"):
		return true
	default:
		return false
	}
}

func detectConditionalGuidance(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	// Match patterns like:
	// "If you modify ..., make sure to update README.md."
	// "If a task requires ..., escalate to ROOT_AGENT."
	// "If you encounter ..., bypass it for local testing but log it."
	for lookahead := idx + 1; lookahead < len(words) && lookahead <= idx+14; lookahead++ {
		if !startsConditionalConsequent(raw, words, lookahead) {
			continue
		}
		if equalWord(raw, words[lookahead].Start, words[lookahead].End, "make") {
			if lookahead+2 >= len(words) {
				return ModalityToken{}, false
			}
			if !equalWord(raw, words[lookahead+1].Start, words[lookahead+1].End, "sure") {
				continue
			}
			if !equalWord(raw, words[lookahead+2].Start, words[lookahead+2].End, "to") {
				continue
			}
			if lookahead+3 >= len(words) {
				return ModalityToken{}, false
			}
			if isImperativeVerb(raw, words[lookahead+3].Start, words[lookahead+3].End) {
				return ModalityToken{Start: words[lookahead].Start, End: words[lookahead+2].End, Mask: ModalityObligation}, true
			}
			continue
		}
		if equalWord(raw, words[lookahead].Start, words[lookahead].End, "do") {
			if lookahead+2 < len(words) &&
				equalWord(raw, words[lookahead+1].Start, words[lookahead+1].End, "not") &&
				isImperativeVerb(raw, words[lookahead+2].Start, words[lookahead+2].End) {
				return ModalityToken{Start: words[lookahead].Start, End: words[lookahead+1].End, Mask: ModalityForbidden}, true
			}
			continue
		}
		if isImperativeVerb(raw, words[lookahead].Start, words[lookahead].End) {
			return ModalityToken{Start: words[lookahead].Start, End: words[lookahead].End, Mask: ModalityObligation}, true
		}
	}
	return ModalityToken{}, false
}

func startsConditionalConsequent(raw []byte, words []wordToken, idx int) bool {
	if idx <= 0 || idx >= len(words) {
		return false
	}
	for i := words[idx].Start - 1; i >= words[idx-1].End; i-- {
		switch raw[i] {
		case ' ', '\t', '\r', '\n':
			continue
		case ',', ';', ':':
			return true
		default:
			return false
		}
	}
	return false
}

func detectIdentityStyle(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	if idx+1 >= len(words) || !equalWord(raw, words[idx].Start, words[idx].End, "you") {
		return ModalityToken{}, false
	}
	next := words[idx+1]
	switch {
	case equalWord(raw, next.Start, next.End, "are"):
		return ModalityToken{Start: words[idx].Start, End: next.End, Mask: ModalityObligation}, true
	case isIdentityStyleVerb(raw, next.Start, next.End):
		return ModalityToken{Start: words[idx].Start, End: next.End, Mask: ModalityObligation}, true
	default:
		return ModalityToken{}, false
	}
}

func detectScopedThirdPersonRule(raw []byte, words []wordToken, idx int) (ModalityToken, bool) {
	if !isScopedRuleSubject(raw, words, idx) {
		return ModalityToken{}, false
	}
	for lookahead := idx + 1; lookahead < len(words) && lookahead <= idx+4; lookahead++ {
		word := words[lookahead]
		switch {
		case equalWord(raw, word.Start, word.End, "must"), equalWord(raw, word.Start, word.End, "shall"), equalWord(raw, word.Start, word.End, "required"):
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		case equalWord(raw, word.Start, word.End, "should"):
			if detectPassiveShouldBe(raw, words, lookahead) {
				return ModalityToken{Start: word.Start, End: words[lookahead+1].End, Mask: ModalityObligation}, true
			}
		}
	}
	return ModalityToken{}, false
}

func detectPassiveShouldBe(raw []byte, words []wordToken, idx int) bool {
	return idx+2 < len(words) &&
		equalWord(raw, words[idx].Start, words[idx].End, "should") &&
		equalWord(raw, words[idx+1].Start, words[idx+1].End, "be") &&
		isImperativeVerb(raw, words[idx+2].Start, words[idx+2].End)
}

func isScopedRuleSubject(raw []byte, words []wordToken, idx int) bool {
	if idx >= len(words) {
		return false
	}
	word := words[idx]
	switch {
	case equalWord(raw, word.Start, word.End, "functions"),
		equalWord(raw, word.Start, word.End, "code"),
		equalWord(raw, word.Start, word.End, "logic"),
		equalWord(raw, word.Start, word.End, "tests"),
		equalWord(raw, word.Start, word.End, "work"):
		return true
	case equalWord(raw, word.Start, word.End, "the"):
		return idx+1 < len(words) && equalWord(raw, words[idx+1].Start, words[idx+1].End, "system")
	case equalWord(raw, word.Start, word.End, "all"):
		return idx+1 < len(words) && equalWord(raw, words[idx+1].Start, words[idx+1].End, "work")
	default:
		return false
	}
}

func isNarrativeRhetoric(raw []byte, words []wordToken, idx int) bool {
	for lookahead := 1; lookahead <= 2 && idx+lookahead < len(words); lookahead++ {
		next := words[idx+lookahead]
		if equalWord(raw, next.Start, next.End, "to") {
			continue
		}
		return isNarrativeRhetoricVerb(raw, next.Start, next.End)
	}
	return false
}

func isMetatextualImperativeContext(raw []byte, words []wordToken, idx int) bool {
	if idx < 4 {
		return false
	}
	// Filter descriptive metatext such as:
	// "The design goal is: preserve high-value shadow rules ..."
	// This uses an imperative verb lexeme after a colon, but the clause is
	// describing the goal or purpose of the system rather than issuing an
	// direct operational instruction to the agent.
	return equalWord(raw, words[idx-4].Start, words[idx-4].End, "the") &&
		equalWord(raw, words[idx-3].Start, words[idx-3].End, "design") &&
		(equalWord(raw, words[idx-2].Start, words[idx-2].End, "goal") ||
			equalWord(raw, words[idx-2].Start, words[idx-2].End, "purpose")) &&
		equalWord(raw, words[idx-1].Start, words[idx-1].End, "is") &&
		hasColonBetween(raw, words[idx-1], words[idx])
}

func isNarrativeRhetoricVerb(raw []byte, start, end int) bool {
	switch {
	case equalWord(raw, start, end, "imagine"),
		equalWord(raw, start, end, "picture"),
		equalWord(raw, start, end, "envision"),
		equalWord(raw, start, end, "suppose"):
		return true
	default:
		return false
	}
}

func isIdentityStyleVerb(raw []byte, start, end int) bool {
	switch {
	case equalWord(raw, start, end, "speak"),
		equalWord(raw, start, end, "reference"),
		equalWord(raw, start, end, "ask"):
		return true
	default:
		return false
	}
}

func isImperativeVerb(raw []byte, start, end int) bool {
	switch {
	case equalWord(raw, start, end, "act"),
		equalWord(raw, start, end, "answer"),
		equalWord(raw, start, end, "ask"),
		equalWord(raw, start, end, "avoid"),
		equalWord(raw, start, end, "be"),
		equalWord(raw, start, end, "bypass"),
		equalWord(raw, start, end, "build"),
		equalWord(raw, start, end, "cite"),
		equalWord(raw, start, end, "change"),
		equalWord(raw, start, end, "check"),
		equalWord(raw, start, end, "compromise"),
		equalWord(raw, start, end, "consult"),
		equalWord(raw, start, end, "create"),
		equalWord(raw, start, end, "delete"),
		equalWord(raw, start, end, "deny"),
		equalWord(raw, start, end, "design"),
		equalWord(raw, start, end, "ensure"),
		equalWord(raw, start, end, "eliminate"),
		equalWord(raw, start, end, "escalate"),
		equalWord(raw, start, end, "follow"),
		equalWord(raw, start, end, "format"),
		equalWord(raw, start, end, "ground"),
		equalWord(raw, start, end, "implement"),
		equalWord(raw, start, end, "inspect"),
		equalWord(raw, start, end, "keep"),
		equalWord(raw, start, end, "leak"),
		equalWord(raw, start, end, "maintain"),
		equalWord(raw, start, end, "mark"),
		equalWord(raw, start, end, "modify"),
		equalWord(raw, start, end, "prefer"),
		equalWord(raw, start, end, "preserve"),
		equalWord(raw, start, end, "prioritize"),
		equalWord(raw, start, end, "pitch"),
		equalWord(raw, start, end, "promise"),
		equalWord(raw, start, end, "include"),
		equalWord(raw, start, end, "read"),
		equalWord(raw, start, end, "reference"),
		equalWord(raw, start, end, "refer"),
		equalWord(raw, start, end, "rebuild"),
		equalWord(raw, start, end, "refactor"),
		equalWord(raw, start, end, "reject"),
		equalWord(raw, start, end, "reduce"),
		equalWord(raw, start, end, "republish"),
		equalWord(raw, start, end, "return"),
		equalWord(raw, start, end, "reveal"),
		equalWord(raw, start, end, "retreat"),
		equalWord(raw, start, end, "rerun"),
		equalWord(raw, start, end, "rewrite"),
		equalWord(raw, start, end, "run"),
		equalWord(raw, start, end, "signal"),
		equalWord(raw, start, end, "skip"),
		equalWord(raw, start, end, "suggest"),
		equalWord(raw, start, end, "structure"),
		equalWord(raw, start, end, "trust"),
		equalWord(raw, start, end, "treat"),
		equalWord(raw, start, end, "update"),
		equalWord(raw, start, end, "use"),
		equalWord(raw, start, end, "validate"),
		equalWord(raw, start, end, "verify"),
		equalWord(raw, start, end, "weaken"),
		equalWord(raw, start, end, "wipe"),
		equalWord(raw, start, end, "write"):
		return true
	default:
		return false
	}
}

// isSetupLeadInWord returns true if the word at idx starts a procedural/setup
// lead-in phrase that establishes instructional context (e.g., "to get", "if you need").
// These phrases signal that connective-borne directives may follow in the same sentence.
func isSetupLeadInWord(raw []byte, words []wordToken, idx int) bool {
	if idx < 1 {
		return false
	}
	// "to get" — most common setup: "to get X running, then run Y"
	// idx is the position of "get", idx-1 is "to"
	isGetWord := equalWord(raw, words[idx].Start, words[idx].End, "get")
	isToPrev := idx >= 1 && equalWord(raw, words[idx-1].Start, words[idx-1].End, "to")
	if isGetWord && isToPrev {
		return true
	}
	// "if you need" — conditional setup: "if you need to update X, check Y"
	// idx is "need", idx-1 is "you", idx-2 is "if"
	isNeedWord := equalWord(raw, words[idx].Start, words[idx].End, "need")
	isYouPrev := idx >= 1 && equalWord(raw, words[idx-1].Start, words[idx-1].End, "you")
	isIfPrevPrev := idx >= 2 && equalWord(raw, words[idx-2].Start, words[idx-2].End, "if")
	if isNeedWord && isYouPrev && isIfPrevPrev {
		return true
	}
	// "if you hit" — troubleshooting setup: "if you hit a wall ... check the docs"
	isHitWord := equalWord(raw, words[idx].Start, words[idx].End, "hit")
	if isHitWord && isYouPrev && isIfPrevPrev {
		return true
	}
	// "the tests are" — factual setup: "the tests are in folder, run them"
	// idx is "tests", idx-1 is "the", idx+1 is "are"
	isTestsWord := equalWord(raw, words[idx].Start, words[idx].End, "tests")
	isThePrev := idx >= 1 && equalWord(raw, words[idx-1].Start, words[idx-1].End, "the")
	isAreNext := idx+1 < len(words) && equalWord(raw, words[idx+1].Start, words[idx+1].End, "are")
	if isTestsWord && isThePrev && isAreNext {
		return true
	}
	return false
}

// detectSetupImperative catches operational guidance buried after a leading instructional
// clause, where the real imperative appears after a connective like "then", "but", or
// a comma rather than at a sentence start. This handles loose-prose guidance like:
//
//	"to get X running just make sure Y then run Z"    — "run" fires after "then" (only when setupLeadInSeen=true)
//	"the tests are in folder,run them with..."         — "run" fires after comma
//	"if you need to update X, check Y but don't..."   — "check" fires after comma, "change" is forbidden after "don't"
//
	// The setupLeadInSeen flag gates the "then" pattern so that bare temporal/sequential
	// "then" in descriptive prose does not auto-promote.
	// Patterns B and C are allowed to fire broadly on imperative verbs because the risk of
	// over-firing is managed by the narrow imperative verb list (not all verbs trigger).
	// Pattern D (don't) remains gated by setupLeadInSeen to keep prohibition detection narrow.
	func detectSetupImperative(raw []byte, words []wordToken, idx int, setupLeadInSeen bool) (ModalityToken, bool) {
		word := words[idx]

		// Pattern 0: after a narrow procedural lead-in, any later imperative in the
		// same sentence is likely intentional guidance. This is the main recovery path
		// for loose prose like:
		//   "if you hit a wall ... check the docs folder first ..."
		//   "the tests are in the tests folder run them ..."
		// It stays gated by the narrow lead-in set, so it does not apply to generic prose.
		if setupLeadInSeen && isImperativeVerb(raw, word.Start, word.End) && !isMetatextualImperativeContext(raw, words, idx) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		}

		// Pattern A: connective "then" introduces the imperative — only after setup lead-in.
		// "to get X running, then run Y" — "then" fires obligation on "run".
		// But "the system then records the event" should NOT fire (no imperative verb follows).
		// The setupLeadInSeen gate prevents bare sequential "then" from promoting prose.
	if equalWord(raw, word.Start, word.End, "then") && setupLeadInSeen {
		for lookahead := idx + 1; lookahead < len(words); lookahead++ {
			if isImperativeVerb(raw, words[lookahead].Start, words[lookahead].End) {
				return ModalityToken{Start: words[lookahead].Start, End: words[lookahead].End, Mask: ModalityObligation}, true
			}
		}
	}

	// Pattern B: "but" introduces a contrasting imperative — obligation on the following verb.
	// "the tests are in folder, run them but make sure..." — "make" fires as obligation.
	// The imperative verb list is conservative; descriptive prose with non-imperative
	// words after "but" (e.g., "the overview is descriptive") does not fire.
	if idx > 0 && equalWord(raw, words[idx-1].Start, words[idx-1].End, "but") {
		if isImperativeVerb(raw, word.Start, word.End) && !equalWord(raw, word.Start, word.End, "forget") {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		}
	}

	// Pattern C: imperative after a comma — fires broadly on imperative verbs.
	// "the tests are in folder, run them with..."
	// The conservative imperative verb list means descriptive clauses with non-imperative
	// words after comma (e.g., "the folder, which contains examples, is public") do not fire.
	if idx > 0 && isCommaPrecededByNonWhitespace(raw, words[idx-1], word) {
		if isImperativeVerb(raw, word.Start, word.End) {
			return ModalityToken{Start: word.Start, End: word.End, Mask: ModalityObligation}, true
		}
	}

	// Pattern D: "don" + "t" + imperative = forbidden — only in setup context.
	// "check X but don't change Y" — "change" is forbidden after "don't".
	// Gated by setupLeadInSeen to prevent prohibition detection in arbitrary prose.
	if setupLeadInSeen && equalWord(raw, word.Start, word.End, "don") && idx+2 < len(words) {
		nextWord := words[idx+1]
		nextNextWord := words[idx+2]
		if equalWord(raw, nextWord.Start, nextWord.End, "t") &&
			isImperativeVerb(raw, nextNextWord.Start, nextNextWord.End) &&
			!equalWord(raw, nextNextWord.Start, nextNextWord.End, "forget") {
			return ModalityToken{Start: nextNextWord.Start, End: nextNextWord.End, Mask: ModalityForbidden}, true
		}
	}

	return ModalityToken{}, false
}

// isCommaPrecededByNonWhitespace returns true if the character immediately before
// the current word is a comma (with optional whitespace between them).
// This detects comma-separated clauses like "folder, run them with...".
func isCommaPrecededByNonWhitespace(raw []byte, prev wordToken, curr wordToken) bool {
	if curr.Start == 0 {
		return false
	}
	// Check the character just before curr.Start (for ",run" with no space).
	if raw[curr.Start-1] == ',' {
		return true
	}
	// Handle comma with whitespace: "folder,  run" — comma is at prev.End-1 (the
	// last char of prev is the comma).
	if prev.End > 0 && raw[prev.End-1] == ',' {
		return true
	}
	return false
}

func toLowerASCII(b byte) byte {
	if b >= 'A' && b <= 'Z' {
		return b + ('a' - 'A')
	}
	return b
}
