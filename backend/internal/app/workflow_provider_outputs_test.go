package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDownloadRunningHubOutputSniffsImageWithoutExtension(t *testing.T) {
	allowLoopbackProviderTest(t)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/octet-stream")
		_, _ = w.Write([]byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"))
	}))
	defer server.Close()

	result, err := (&Service{}).downloadWorkflowOutputs(context.Background(), []string{server.URL + "/download?id=generated"})
	if err != nil {
		t.Fatal(err)
	}
	images, ok := result["images"].([]map[string]interface{})
	if !ok || len(images) != 1 {
		t.Fatalf("images = %#v, want one detected PNG", result["images"])
	}
	if got := images[0]["mimeType"]; got != "image/png" {
		t.Fatalf("mimeType = %#v, want image/png", got)
	}
}
