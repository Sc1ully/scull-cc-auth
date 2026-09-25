-- Migration 11: Fix all security advisors
-- Addresses: security_definer_view, rls_enabled_no_policy,
--           function_search_path_mutable, anon_security_definer_function_executable,
--           authenticated_security_definer_function_executable

-- 1. Drop the SECURITY DEFINER view (replaced by direct key_claims + key_inventory JOIN)
--    The frontend now queries key_claims with a JOIN to key_inventory,
--    using the RLS policy added in migration 10 that allows
--    authenticated users to SELECT their own key.
DROP VIEW IF EXISTS public.user_keys;

-- 2. Add SELECT policy on app_settings for authenticated users
--    (fixes "RLS Enabled, No Policy" advisor)
CREATE POLICY "authenticated can read public settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- 3. Set search_path on functions with mutable search_path
--    (fixes "Function Search Path Mutable" advisor)
ALTER FUNCTION public.claim_available_key(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_user_updated() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- 4. Revoke EXECUTE from anon on SECURITY DEFINER functions
--    (fixes "Anon Can Execute SECURITY DEFINER Function" advisor)
REVOKE EXECUTE ON FUNCTION public.claim_available_key(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_user_updated() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;

-- 5. Revoke EXECUTE from authenticated on SECURITY DEFINER functions
--    (fixes "Authenticated Can Execute SECURITY DEFINER Function" advisor)
REVOKE EXECUTE ON FUNCTION public.claim_available_key(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_user_updated() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- 6. Grant EXECUTE to service_role only (Edge Functions still work)
GRANT EXECUTE ON FUNCTION public.claim_available_key(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;
