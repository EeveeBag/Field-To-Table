import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'

export const useMenu = () => {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await client.api.recipes.$get({
        query: {}
      })
      return res.json()
    }
  })
}
