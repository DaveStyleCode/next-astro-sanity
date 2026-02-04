import {StringInputProps} from 'sanity'
import {Button, Stack, ThemeProvider} from '@sanity/ui'
import {LaunchIcon} from '@sanity/icons'

export function UrlWithLink(props: StringInputProps) {
  const {value, renderDefault} = props

  return (
    <ThemeProvider>
      <Stack space={3}>
        {renderDefault(props)}
        {value && (
          <Button
            as="a"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            text="Open link"
            icon={LaunchIcon}
            tone="primary"
            mode="ghost"
            fontSize={1}
            padding={2}
          />
        )}
      </Stack>
    </ThemeProvider>
  )
}
