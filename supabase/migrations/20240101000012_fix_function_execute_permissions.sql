-- Migration 12: Fix SECURITY DEFINER function EXECUTE permissions
-- Migration 11 revoked FROM anon/authenticated, but those roles get
-- EXECUTE via the PUBLIC pseudo-role (the default grant).
-- This migration revokes from PUBLIC and re-grants to service_role only.

-- Revoke default EXECUTE from PUBLIC on SECURITY DEFINER functions
-- (this is what actually grants access to anon and authenticated)
REVOKE EXECUTE ON FUNCTION public.claim_available_key(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_user_updated() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

-- Ensure service_role still has explicit EXECUTE
GRANT EXECUTE ON FUNCTION public.claim_available_key(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;

-- Trigger/event-trigger functions don't need EXECUTE permission
-- (they're invoked by the trigger mechanism, not via RPC), so no
-- grant is needed for handle_new_user or handle_user_updated.
