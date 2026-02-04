import type {StructureResolver, DefaultDocumentNodeResolver} from 'sanity/structure'
import {Iframe} from 'sanity-plugin-iframe-pane'
import {DraftsList} from './components/DraftsList'

// Preview URL resolver for community documents
function getPreviewUrl(doc: Record<string, unknown> | null | undefined) {
  const baseUrl = window.location.origin
  if (doc && doc._type === 'community' && doc._id) {
    // Remove 'drafts.' prefix if present
    const id = String(doc._id).replace(/^drafts\./, '')
    return `${baseUrl}/communities/${id}`
  }
  return baseUrl
}

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  if (schemaType === 'community') {
    return S.document().views([
      S.view.form(),
      S.view
        .component(Iframe)
        .options({
          url: (doc: Record<string, unknown>) => getPreviewUrl(doc),
          reload: {button: true},
          // Enable communication with @sanity/visual-editing
          showDisplayUrl: true,
        })
        .title('Preview'),
    ])
  }
  return S.document()
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Properties section with flat navigation
      S.listItem()
        .title('Properties')
        .icon(() => '🏠')
        .child(
          S.list()
            .title('Properties')
            .items([
              // States - clicking opens the state document directly (uses default handling)
              // S.listItem()
              //   .title('States')
              //   .icon(() => '🇺🇸')
              //   .child(S.documentTypeList('state').title('States')),

              // Browse by State - hierarchical navigation
              S.listItem()
                .title('Browse by State')
                .icon(() => '📍')
                .child(
                  S.documentTypeList('state')
                    .title('Select a State')
                    .child((stateId) => {
                      if (!stateId) {
                        return S.list().title('Error').items([])
                      }
                      const baseId = stateId.replace(/^drafts\./, '')
                      return S.list()
                        .title('Browse')
                        .id(`browse-${baseId}`)
                        .items([
                          S.listItem()
                            .title('Areas')
                            .id('areas')
                            .icon(() => '📍')
                            .child(
                              S.documentList()
                                .title('Areas')
                                .id(`areas-${baseId}`)
                                .filter('_type == "areas" && stateRef._ref == $stateId')
                                .apiVersion('2024-01-01')
                                .params({stateId: baseId})
                                .child((areaId) =>
                                  S.documentList()
                                    .title('Communities')
                                    .filter('_type == "community" && areaRef._ref == $areaId')
                                    .apiVersion('2024-01-01')
                                    .params({areaId}),
                                ),
                            ),
                          S.listItem()
                            .title('Communities')
                            .id('communities')
                            .icon(() => '🏘️')
                            .child(
                              S.documentList()
                                .title('Communities')
                                .id(`communities-${baseId}`)
                                .filter('_type == "community" && stateRef._ref == $stateId')
                                .apiVersion('2024-01-01')
                                .params({stateId: baseId}),
                            ),
                          S.listItem()
                            .title('Floor Plans')
                            .id('floorPlans')
                            .icon(() => '📐')
                            .child(
                              S.documentList()
                                .title('Floor Plans')
                                .id(`floor-plans-${baseId}`)
                                .filter(
                                  '_type == "floorPlan" && communityRef->stateRef._ref == $stateId',
                                )
                                .apiVersion('2024-01-01')
                                .params({stateId: baseId})
                                .defaultOrdering([{field: 'name', direction: 'asc'}]),
                            ),
                          S.listItem()
                            .title('Houses')
                            .id('houses')
                            .icon(() => '🏠')
                            .child(
                              S.documentList()
                                .title('Houses')
                                .id(`houses-${baseId}`)
                                .filter(
                                  '_type == "house" && communityRef->stateRef._ref == $stateId',
                                )
                                .apiVersion('2024-01-01')
                                .params({stateId: baseId})
                                .defaultOrdering([{field: 'address', direction: 'asc'}]),
                            ),
                        ])
                    }),
                ),

              S.divider(),

              // All content lists
              S.listItem()
                .title('All Areas')
                .icon(() => '📍')
                .child(S.documentTypeList('areas').title('All Areas')),
              S.listItem()
                .title('All Communities')
                .icon(() => '🏘️')
                .child(S.documentTypeList('community').title('All Communities')),
              S.listItem()
                .title('All Floor Plans')
                .icon(() => '📐')
                .child(S.documentTypeList('floorPlan').title('All Floor Plans')),
              S.listItem()
                .title('All Houses')
                .icon(() => '🏠')
                .child(
                  S.documentTypeList('house')
                    .title('All Houses')
                    .defaultOrdering([{field: 'address', direction: 'asc'}]),
                ),
            ]),
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['state', 'community', 'areas', 'floorPlan', 'house'].includes(listItem.getId() || ''),
      ),

      S.divider(),

      S.listItem()
        .title('All Drafts')
        .child(S.component(DraftsList).title('Draft Documents').id('all-drafts')),
    ])
