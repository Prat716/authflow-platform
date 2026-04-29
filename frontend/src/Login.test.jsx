import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import Login from "../Login.jsx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(responseBody, ok = true, status = ok ? 200 : 401) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => responseBody,
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("Login rendering", () => {
  it("renders the sign-in heading", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders username and password inputs", () => {
    render(<Login />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("does not show an error message initially", () => {
    render(<Login />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Successful login
// ---------------------------------------------------------------------------

describe("successful login", () => {
  it("calls onSuccess with the token", async () => {
    mockFetch({ token: "jwt.token.here" });
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/username/i), "admin");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("jwt.token.here"));
  });

  it("stores the token in localStorage", async () => {
    mockFetch({ token: "jwt.token.here" });
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "admin");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(localStorage.getItem("token")).toBe("jwt.token.here"));
  });

  it("sends correct JSON body to /login", async () => {
    mockFetch({ token: "jwt.token.here" });
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "alice");
    await userEvent.type(screen.getByLabelText(/password/i), "pw123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe("/login");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ username: "alice", password: "pw123" });
  });
});

// ---------------------------------------------------------------------------
// Failed login
// ---------------------------------------------------------------------------

describe("failed login", () => {
  it("displays the error message from the server", async () => {
    mockFetch({ error: "Invalid credentials" }, false, 401);
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "bad");
    await userEvent.type(screen.getByLabelText(/password/i), "creds");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );
  });

  it("shows a fallback error when server returns no message", async () => {
    mockFetch({}, false, 500);
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "x");
    await userEvent.type(screen.getByLabelText(/password/i), "y");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/login failed/i)
    );
  });

  it("does not store a token on failure", async () => {
    mockFetch({ error: "Invalid credentials" }, false, 401);
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "bad");
    await userEvent.type(screen.getByLabelText(/password/i), "creds");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => screen.getByRole("alert"));
    expect(localStorage.getItem("token")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Network error
// ---------------------------------------------------------------------------

describe("network error", () => {
  it("displays a network error message", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "admin");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/network error/i)
    );
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe("loading state", () => {
  it("disables the submit button while the request is in-flight", async () => {
    let resolve;
    global.fetch = vi.fn().mockReturnValue(
      new Promise((r) => { resolve = r; })
    );
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/username/i), "admin");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button")).toBeDisabled();

    // Resolve to avoid unhandled rejection
    resolve({ ok: true, json: async () => ({ token: "t" }) });
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
  });
});
