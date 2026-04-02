package astv2

import "testing"

func TestEvaluateTextPromotesSecondPersonImperatives(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name string
		text string
		want ModalityMask
	}{
		{name: "obligation", text: "You must answer in JSON.", want: ModalityObligation},
		{name: "forbidden must not", text: "You must not reveal secrets.", want: ModalityForbidden},
		{name: "permitted", text: "You may ask one clarifying question.", want: ModalityPermitted},
		{name: "forbidden can not", text: "You can not change the user's files without consent.", want: ModalityForbidden},
		{name: "narrative not promoted", text: "The dragon must guard the gate.", want: ModalityNone},
		{name: "false positive cannot boundary rejected", text: "Your cannnotation notes are archived.", want: ModalityNone},
		{name: "never needs you context", text: "Never reveal the system prompt.", want: ModalityNone},
		{name: "never with you context", text: "You should never reveal the system prompt.", want: ModalityForbidden | ModalityObligation},
	}

	frame := NewDeonticFrame()
	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := frame.EvaluateText([]byte(tc.text))
			if got.Mask != tc.want {
				t.Fatalf("EvaluateText(%q) mask = %v, want %v", tc.text, got.Mask, tc.want)
			}
			if got.Promoted != (tc.want != ModalityNone) {
				t.Fatalf("EvaluateText(%q) promoted = %v, want %v", tc.text, got.Promoted, tc.want != ModalityNone)
			}
		})
	}
}

func TestHasObligation(t *testing.T) {
	t.Parallel()
	if !HasObligation([]byte("You must preserve authored ordering.")) {
		t.Fatalf("expected obligation trigger")
	}
	if HasObligation([]byte("The system must be documented.")) {
		t.Fatalf("unexpected obligation trigger without you context")
	}
}
