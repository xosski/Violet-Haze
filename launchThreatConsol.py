import subprocess
import time
import webbrowser
import os
import shutil
import sys
import json
import re
# CONFIGURATION
FRONTEND_DIR = os.path.abspath(".")  # Set this to your Next.js root directory
BACKEND_SCRIPT = os.path.abspath("scanner.py")  # Adjust if path is different
URL = "http://localhost:3000"

def start_backend():
    print("[🧠] Starting backend scanner service...")
    return subprocess.Popen([sys.executable, BACKEND_SCRIPT], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
def tail_file(path: str, lines: int = 50) -> str:
    try:
        with open(path, "rb") as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            chunk = 4096
            data = b""
            while size > 0 and data.count(b"\n") <= lines:
                size = max(0, size - chunk)
                f.seek(size)
                data = f.read(4096) + data
        return data.decode(errors="replace").splitlines()[-lines:]
    except Exception as e:
        return [f"(failed to read log: {e})"]

def parse_next_url_from_log(log_path: str) -> str | None:
    # Try to find "url: http://localhost:3000" or similar in Next.js logs
    url_pattern = re.compile(r"(http://localhost:\d+)")
    try:
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                m = url_pattern.search(line)
                if m:
                    return m.group(1)
    except Exception:
        pass
    return None
def main():
    print("[⚙️] Booting up the Threat Console environment...")

    frontend_proc, frontend_log, frontend_log_path = start_frontend()

    # Try to detect actual URL from Next.js logs (in case it picked a different port)
    url_to_open = URL
    for _ in range(10):  # give Next.js a few seconds to print its startup line
        time.sleep(1)
        detected = parse_next_url_from_log(frontend_log_path)
        if detected:
            url_to_open = detected
            break
        # Abort early if the frontend process already exited
        if frontend_proc.poll() is not None:
            print(f"[❌] Frontend process exited early (code {frontend_proc.poll()}). Log tail:", file=sys.stderr)
            print("\n".join(tail_file(frontend_log_path)))
            return

    print(f"[⏳] Waiting for frontend to be ready at {url_to_open} ...")
    if not wait_for_server(url_to_open, timeout=120):
        print(f"[❌] Frontend did not become ready within timeout. Check logs: {frontend_log_path}", file=sys.stderr)
        try:
            print("--- frontend-dev.log (tail) ---")
            print("\n".join(tail_file(frontend_log_path)))
            print("-------------------------------")
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        return

    backend_proc = start_backend()
    time.sleep(2)

    print(f"[✅] Console launched at {url_to_open}")
    webbrowser.open(url_to_open)

    try:
        print("[💡] Press Ctrl+C to shut down.")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[⏹️] Shutting down...")
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_log.close()
        except Exception:
            pass
        print("[✔️] All processes terminated.")

def resolve_npm() -> str | None:
    # Try to find npm across platforms
    if os.name == "nt":
        for name in ("npm", "npm.cmd"):
            path = shutil.which(name)
            if path:
                return path
        for path in (
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files (x86)\nodejs\npm.cmd",
            os.path.expandvars(r"%LocalAppData%\Programs\nodejs\npm.cmd"),
        ):
            if os.path.isfile(path):
                return path
        return None
    else:
        return shutil.which("npm")

# --- add: helpers to ensure Next.js is installed ---
def _has_next_binary(frontend_dir: str) -> bool:
    bin_dir = os.path.join(frontend_dir, "node_modules", ".bin")
    candidates = [os.path.join(bin_dir, "next")]
    if os.name == "nt":
        candidates.append(os.path.join(bin_dir, "next.cmd"))
    return any(os.path.isfile(p) for p in candidates)

def ensure_frontend_dependencies(npm_path: str, frontend_dir: str):
    pkg_json = os.path.join(frontend_dir, "package.json")
    if not os.path.isfile(pkg_json):
        raise FileNotFoundError(f"package.json not found in {frontend_dir}. Set FRONTEND_DIR to your Next.js app root.")

    with open(pkg_json, "r", encoding="utf-8") as f:
        pkg = json.load(f)

    has_next_declared = "next" in (pkg.get("dependencies", {}) | pkg.get("devDependencies", {}))
    if not has_next_declared:
        print("Warning: 'next' is not listed in dependencies/devDependencies of package.json.", file=sys.stderr)
        print("Add Next.js with: npm install next react react-dom", file=sys.stderr)

    if _has_next_binary(frontend_dir):
        return  # already installed

    # Choose install method
    lock_ci = os.path.isfile(os.path.join(frontend_dir, "package-lock.json"))
    cmd = [npm_path, "ci"] if lock_ci else [npm_path, "install"]

    print(f"[📦] Installing frontend dependencies ({'npm ci' if lock_ci else 'npm install'}) ...")
    install_log = os.path.join(frontend_dir, "frontend-install.log")
    with open(install_log, "wb") as log_file:
        result = subprocess.run(
            cmd,
            cwd=frontend_dir,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            shell=(os.name == "nt"),  # allow npm.cmd execution
        )
    if result.returncode != 0:
        raise RuntimeError(
            f"Dependency installation failed (exit {result.returncode}). See log: {install_log}"
        )
    if not _has_next_binary(frontend_dir):
        raise RuntimeError(
            f"'next' binary still not found after install. Check {install_log} and ensure 'next' is in package.json."
        )

def start_frontend():
    # Ensure the frontend directory exists
    if not os.path.isdir(FRONTEND_DIR):
        raise FileNotFoundError(f"Frontend directory not found: {os.path.abspath(FRONTEND_DIR)}")

    npm_path = resolve_npm()
    if not npm_path:
        raise FileNotFoundError(
            "npm was not found on your system. Install Node.js (which includes npm) "
            "and ensure npm is available on PATH. Try running `npm -v` in a new terminal."
        )

    # Ensure dependencies (including Next.js) are installed
    ensure_frontend_dependencies(npm_path, FRONTEND_DIR)

    # Optional: warn if 'dev' script is missing
    pkg_json = os.path.join(FRONTEND_DIR, "package.json")
    if os.path.isfile(pkg_json):
        try:
            with open(pkg_json, "r", encoding="utf-8") as f:
                pkg = json.load(f)
            if "scripts" not in pkg or "dev" not in pkg["scripts"]:
                print("Warning: 'dev' script not found in package.json. 'npm run dev' may fail.", file=sys.stderr)
        except Exception:
            pass

    try:
        # First attempt: direct execution
        return subprocess.Popen(
            [npm_path, "run", "dev"],
            cwd=FRONTEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except FileNotFoundError as e:
        # Fallback for Windows: run via shell
        if os.name == "nt":
            return subprocess.Popen(
                f'"{npm_path}" run dev',
                cwd=FRONTEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True,
            )
        # Re-raise for non-Windows
        raise FileNotFoundError(
            f"Failed to start frontend. cwd='{os.path.abspath(FRONTEND_DIR)}', npm='{npm_path}'. Original error: {e}"
        )
def start_frontend():
    # Ensure the frontend directory exists
    if not os.path.isdir(FRONTEND_DIR):
        raise FileNotFoundError(f"Frontend directory not found: {os.path.abspath(FRONTEND_DIR)}")

    npm_path = resolve_npm()
    if not npm_path:
        raise FileNotFoundError(
            "npm was not found on your system. Install Node.js (which includes npm) "
            "and ensure npm is available on PATH. Try running `npm -v` in a new terminal."
        )

    # Optional: warn if 'dev' script is missing
    pkg_json = os.path.join(FRONTEND_DIR, "package.json")
    if os.path.isfile(pkg_json):
        try:
            with open(pkg_json, "r", encoding="utf-8") as f:
                pkg = json.load(f)
            if "scripts" not in pkg or "dev" not in pkg["scripts"]:
                print("Warning: 'dev' script not found in package.json. 'npm run dev' may fail.", file=sys.stderr)
        except Exception:
            pass

    # Log Next.js output to a file to avoid PIPE blocking
    log_path = os.path.join(FRONTEND_DIR, "frontend-dev.log")
    log_file = open(log_path, "wb")

    env = os.environ.copy()
    env.setdefault("PORT", "3000")  # force Next.js dev server port

    try:
        # Direct execution with file-backed stdout/stderr
        proc = subprocess.Popen(
            [npm_path, "run", "dev"],
            cwd=FRONTEND_DIR,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            env=env,
        )
        print(f"[🌐] Starting Next.js frontend... (logs: {log_path})")
        return proc, log_file, log_path
    except FileNotFoundError as e:
        # Fallback for Windows: run via shell
        if os.name == "nt":
            proc = subprocess.Popen(
                f'"{npm_path}" run dev',
                cwd=FRONTEND_DIR,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                shell=True,
                env=env,
            )
            print(f"[🌐] Starting Next.js frontend (shell)... (logs: {log_path})")
            return proc, log_file, log_path
        # Re-raise for non-Windows
        raise FileNotFoundError(
            f"Failed to start frontend. cwd='{os.path.abspath(FRONTEND_DIR)}', npm='{npm_path}'. Original error: {e}"
        )

def wait_for_server(url: str, timeout: int = 60, interval: float = 0.5) -> bool:
    import urllib.request
    import urllib.error

    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                # 200 OK means server is up
                if 200 <= resp.status < 400:
                    return True
        except Exception:
            time.sleep(interval)
    return False

if __name__ == "__main__":
    main()