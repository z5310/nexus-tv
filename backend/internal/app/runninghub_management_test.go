package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFetchRunningHubAppInfoUsesOfficialGetEndpoint(t *testing.T) {
	t.Setenv("CANVAS_ALLOWED_PRIVATE_UPSTREAM_HOSTS", "127.0.0.1")

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("method = %s, want GET", r.Method)
		}
		if r.URL.Path != "/api/webapp/apiCallDemo" {
			t.Fatalf("path = %s, want /api/webapp/apiCallDemo", r.URL.Path)
		}
		if got := r.URL.Query().Get("apiKey"); got != "test-api-key" {
			t.Fatalf("apiKey = %q, want test-api-key", got)
		}
		if got := r.URL.Query().Get("webappId"); got != "2083894278044372993" {
			t.Fatalf("webappId = %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"code": 0,
			"data": map[string]any{
				"nodeInfoList": []any{map[string]any{
					"nodeId": "1", "fieldName": "prompt", "fieldValue": "", "fieldType": "STRING",
				}},
			},
		})
	}))
	defer server.Close()

	result, err := (&Service{}).FetchRunningHubAppInfo(context.Background(), RunningHubWorkflowFetchRequest{
		BaseURL:    server.URL,
		APIKey:     "test-api-key",
		WebappID:   "2083894278044372993",
		Capability: "image",
	})
	if err != nil {
		t.Fatal(err)
	}
	fields, _ := result["fields"].([]map[string]any)
	if len(fields) != 1 || fields[0]["fieldName"] != "prompt" {
		t.Fatalf("fields = %#v", fields)
	}
}
