import {useEffect, useState, useCallback} from 'react'
import {useClient, useSchema} from 'sanity'
import {useRouter} from 'sanity/router'
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
  ThemeProvider,
  studioTheme,
} from '@sanity/ui'
import {PublishIcon, SearchIcon} from '@sanity/icons'

interface DraftDocument {
  _id: string
  _type: string
  _updatedAt: string
  title?: string
  name?: string
  address?: string
}

export function DraftsList() {
  const client = useClient({apiVersion: '2024-01-01'})
  const schema = useSchema()
  const router = useRouter()
  const [drafts, setDrafts] = useState<DraftDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [publishing, setPublishing] = useState<Set<string>>(new Set())

  const fetchDrafts = useCallback(async () => {
    try {
      // Use perspective: 'raw' to see actual draft documents
      const results = await client.fetch<DraftDocument[]>(
        `*[_id match "drafts.*" && !(_type match "sanity.*")] | order(_updatedAt desc) {
          _id,
          _type,
          _updatedAt,
          title,
          name,
          address
        }[0...100]`,
        {},
        {perspective: 'raw'},
      )
      setDrafts(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchDrafts()

    // Subscribe to real-time updates for draft documents
    // Use includeResult: false to avoid _rev issues with raw documents
    const subscription = client
      .listen('*[_id match "drafts.*"]', {}, {includeResult: false})
      .subscribe({
        next: () => {
          fetchDrafts()
        },
        error: (err) => {
          console.error('Subscription error:', err)
        },
      })

    return () => subscription.unsubscribe()
  }, [client, fetchDrafts])

  const getDocumentTitle = (doc: DraftDocument) => {
    return doc.title || doc.name || doc.address || doc._id
  }

  const getSchemaTitle = (typeName: string) => {
    const schemaType = schema.get(typeName)
    return schemaType?.title || typeName
  }

  const getDocumentId = (draftId: string) => {
    return draftId.replace(/^drafts\./, '')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleClick = (doc: DraftDocument) => {
    const id = getDocumentId(doc._id)
    router.navigateIntent('edit', {id, type: doc._type})
  }

  const handlePublishDraft = async (e: React.MouseEvent, doc: DraftDocument) => {
    e.stopPropagation() // Prevent card click navigation

    const draftId = doc._id
    const publishedId = getDocumentId(draftId)

    setPublishing((prev) => new Set(prev).add(draftId))

    try {
      // Fetch the full draft document
      const draftDoc = await client.fetch(`*[_id == $id][0]`, {id: draftId}, {perspective: 'raw'})
      if (!draftDoc) {
        throw new Error('Draft not found')
      }

      // Build the published document
      const publishedDoc: Record<string, unknown> = {
        _id: publishedId,
        _type: doc._type,
      }
      for (const [key, value] of Object.entries(draftDoc)) {
        if (!['_id', '_type', '_rev', '_updatedAt', '_createdAt'].includes(key)) {
          publishedDoc[key] = value
        }
      }

      // Publish: create/replace published doc and delete draft
      await client.mutate([
        {createOrReplace: publishedDoc as {_id: string; _type: string}},
        {delete: {id: draftId}},
      ])

      // Remove from local state
      setDrafts((prev) => prev.filter((d) => d._id !== draftId))
    } catch (err) {
      console.error('Failed to publish:', err)
      alert(`Failed to publish: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setPublishing((prev) => {
        const next = new Set(prev)
        next.delete(draftId)
        return next
      })
    }
  }

  const filteredDrafts = drafts.filter((doc) => {
    if (!search.trim()) return true
    const searchLower = search.toLowerCase()
    const title = getDocumentTitle(doc).toLowerCase()
    const typeName = getSchemaTitle(doc._type).toLowerCase()
    return title.includes(searchLower) || typeName.includes(searchLower)
  })

  const renderContent = () => {
    if (loading) {
      return (
        <Flex align="center" justify="center" padding={5}>
          <Spinner muted />
        </Flex>
      )
    }

    if (error) {
      return (
        <Card padding={4} tone="critical" radius={2}>
          <Text>Error: {error}</Text>
        </Card>
      )
    }

    if (drafts.length === 0) {
      return (
        <Box padding={4}>
          <Text muted size={1}>
            No unpublished drafts found.
          </Text>
        </Box>
      )
    }

    return (
      <Stack space={2} padding={2}>
        <Box paddingX={2} paddingY={1}>
          <TextInput
            icon={SearchIcon}
            placeholder="Filter drafts..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius={2}
            fontSize={1}
          />
        </Box>

        {filteredDrafts.length === 0 && search.trim() ? (
          <Box padding={4}>
            <Text muted size={1}>
              No drafts match &ldquo;{search}&rdquo;
            </Text>
          </Box>
        ) : (
          <Stack space={1} paddingX={2}>
            {filteredDrafts.map((doc) => (
              <Card
                key={doc._id}
                padding={3}
                radius={2}
                shadow={1}
                tone="default"
                style={{cursor: 'pointer'}}
                onClick={() => handleClick(doc)}
              >
                <Flex justify="space-between" align="center">
                  <Stack space={2}>
                    <Text weight="medium" size={2}>
                      {getDocumentTitle(doc).charAt(0).toUpperCase() +
                        getDocumentTitle(doc).slice(1)}
                    </Text>
                    <Text muted size={1}>
                      {getSchemaTitle(doc._type)} • {formatDate(doc._updatedAt)}
                    </Text>
                  </Stack>
                  <Button
                    text={publishing.has(doc._id) ? 'Publishing...' : 'Publish'}
                    icon={PublishIcon}
                    tone="default"
                    fontSize={1}
                    padding={2}
                    disabled={publishing.has(doc._id)}
                    onClick={(e) => handlePublishDraft(e, doc)}
                  />
                </Flex>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    )
  }

  return <ThemeProvider theme={studioTheme}>{renderContent()}</ThemeProvider>
}
