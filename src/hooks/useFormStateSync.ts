import type { FormApi } from '@tanstack/react-form'
import { useEffect } from 'react'
import type { Address } from '@/api/addresses'
import type { Asset } from '@/api/assets'
import type { Vault } from '@/api/vaults'
import type { TransferFormValues } from '@/schemas/transfer'

interface UseFormStateSyncOptions {
  form: FormApi<TransferFormValues>
  selectedAsset: Asset | null
  selectedVault: Vault | null
  selectedAddress: Address | null
}

/**
 * Hook to sync hook-based state (from useSelectedAsset, etc.) with TanStack Form state
 * Components update hooks directly, but form needs to stay in sync for validation
 */
export const useFormStateSync = ({
  form,
  selectedAsset,
  selectedVault,
  selectedAddress,
}: UseFormStateSyncOptions) => {
  // Sync hook-based state to form (components update hooks, form needs to stay in sync)
  useEffect(() => {
    if (selectedAsset !== form.state.values.asset) {
      form.setFieldValue('asset', selectedAsset as any)
    }
  }, [selectedAsset, form.state.values.asset, form.setFieldValue])

  useEffect(() => {
    if (selectedVault !== form.state.values.vault) {
      form.setFieldValue('vault', selectedVault as any)
    }
  }, [selectedVault, form.state.values.vault, form.setFieldValue])

  useEffect(() => {
    if (selectedAddress !== form.state.values.toAddress) {
      form.setFieldValue('toAddress', selectedAddress as any)
    }
  }, [selectedAddress, form.state.values.toAddress, form.setFieldValue])
}
