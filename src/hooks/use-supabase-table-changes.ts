import { useEffect, useRef } from "react"
import { supabase, getCurrentUserId } from "@/lib/supabase-client"
import type { Database } from "@/interfaces/supabase/database.types"

type TableName = keyof Database["public"]["Tables"]

interface UseSupabaseTableChangesOptions {
  table: TableName
  onChange: () => void | Promise<void>
}

let channelCounter = 0

export function useSupabaseTableChanges({ table, onChange }: UseSupabaseTableChangesOptions) {
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    getCurrentUserId()
      .then((userId) => {
        if (!active || !userId) return

        channelCounter += 1
        channel = supabase
          .channel(`${table}-changes-${userId}-${channelCounter}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table,
              filter: `user_id=eq.${userId}`,
            },
            () => {
              void onChangeRef.current()
            },
          )
          .subscribe()
      })
      .catch(() => {
        // Initial page load still reads through the repository; realtime is opportunistic.
      })

    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [table])
}
