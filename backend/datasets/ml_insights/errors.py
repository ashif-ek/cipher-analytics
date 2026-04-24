def build_error(error_code: str, message: str, action_hint: str = "", debug: dict = None) -> dict:
    """
    Constructs a standard structured v2 JSON error response.
    Never raises an exception. Always returns a safe dictionary.
    """
    return {
        "version": "v2",
        "status": "failed",
        "error_code": error_code,
        "message": message,
        "action_hint": action_hint,
        "debug": debug or {}
    }
