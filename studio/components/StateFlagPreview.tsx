import {USStateFlags, getStateByName} from 'us-state-flags'

interface StateFlagPreviewProps {
  stateName: string
}

export function StateFlagPreview({stateName}: StateFlagPreviewProps) {
  const stateData = getStateByName(stateName)

  if (!stateData) {
    return <span>🇺🇸</span>
  }

  return <USStateFlags state={stateName} showFlag flagSize="lg" />
}
