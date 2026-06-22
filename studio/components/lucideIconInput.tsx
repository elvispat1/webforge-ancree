/**
 * Input string custom pour choisir une icône lucide dans une grille searchable.
 *
 * La valeur stockée reste une simple chaîne `lucide:<nom>` (ex. lucide:ruler),
 * identique à ce que la saisie texte produisait avant: le front (transform.ts,
 * highlights.vue) est INCHANGÉ, le round-trip des valeurs existantes
 * (lucide:hammer, lucide:ruler, lucide:shield-check, lucide:trees) marche tel
 * quel.
 *
 * L'aperçu se rend à partir du `body` autosuffisant de la collection lucide
 * (les attributs fill/stroke/stroke-width/stroke-linecap/stroke-linejoin sont
 * déjà bakés dans chaque body): un simple <svg viewBox="0 0 24 24"> avec le body
 * suffit, aucune API ni dépendance de rendu (pas de @iconify/react).
 *
 * Le champ reste optionnel: une valeur vide est valide, le bouton « Retirer »
 * permet de revenir à vide.
 */
import {useMemo, useState} from 'react'
import {set, unset, type StringInputProps} from 'sanity'
import {Card, Stack, Flex, Box, Text, TextInput, Grid, Button, Tooltip} from '@sanity/ui'
import lucideData from '@iconify-json/lucide/icons.json'

const ICONS = (lucideData as {icons: Record<string, {body: string}>}).icons
const ICON_NAMES = Object.keys(ICONS).sort()

const PREFIX = 'lucide:'
// Au repos (aucune recherche), on n'affiche qu'un petit aperçu: la grille
// complète était trop envahissante. La recherche par nom fait le vrai travail.
const PREVIEW_COUNT = 16
// Par recherche, on cape les résultats pour garder la grille légère.
const MAX_RESULTS = 60
// Galerie officielle pour parcourir les noms d'icônes avant de rechercher ici.
const LUCIDE_GALLERY = 'https://lucide.dev/icons/'

function LucidePreview({name, size}: {name: string; size: number}) {
  const body = ICONS[name]?.body
  if (!body) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden
      dangerouslySetInnerHTML={{__html: body}}
    />
  )
}

export function LucideIconInput(props: StringInputProps) {
  const {value, onChange, elementProps} = props
  const currentName =
    value && value.startsWith(PREFIX) ? value.slice(PREFIX.length) : undefined

  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const matches = useMemo(
    () => (q ? ICON_NAMES.filter((name) => name.includes(q)) : ICON_NAMES),
    [q]
  )
  // Au repos: petit aperçu. En recherche: les résultats, capés.
  const limit = q ? MAX_RESULTS : PREVIEW_COUNT
  const results = matches.slice(0, limit)
  const truncated = matches.length > limit

  return (
    <Stack space={3}>
      {currentName && (
        <Card padding={3} radius={2} shadow={1} tone="primary">
          <Flex align="center" gap={3}>
            <LucidePreview name={currentName} size={24} />
            <Box flex={1}>
              <Text size={1} weight="medium" muted>
                {value}
              </Text>
            </Box>
            <Button
              mode="ghost"
              tone="critical"
              text="Retirer"
              fontSize={1}
              padding={2}
              onClick={() => onChange(unset())}
            />
          </Flex>
        </Card>
      )}

      <TextInput
        {...elementProps}
        placeholder="Rechercher une icône..."
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />

      <Text size={1} muted>
        Recherche par nom, ou parcours la galerie complète sur{' '}
        <a href={LUCIDE_GALLERY} target="_blank" rel="noreferrer">lucide.dev</a>.
      </Text>

      {q ? (
        truncated && (
          <Text size={1} muted>
            {matches.length} résultats (affichage limité aux {MAX_RESULTS} premiers)
          </Text>
        )
      ) : (
        <Text size={1} muted>
          Aperçu de {results.length} icônes sur {ICON_NAMES.length}. Recherche pour voir les autres.
        </Text>
      )}

      {results.length === 0 ? (
        <Text size={1} muted>
          Aucune icône ne correspond.
        </Text>
      ) : (
        <Grid columns={8} gap={1}>
          {results.map((name) => {
            const selected = name === currentName
            return (
              <Tooltip
                key={name}
                content={
                  <Box padding={2}>
                    <Text size={1}>{name}</Text>
                  </Box>
                }
                placement="top"
                portal
              >
                <Button
                  mode={selected ? 'default' : 'bleed'}
                  tone={selected ? 'primary' : 'default'}
                  padding={2}
                  aria-label={`Choisir l'icône ${name}`}
                  aria-pressed={selected}
                  onClick={() => onChange(set(PREFIX + name))}
                >
                  <Flex align="center" justify="center">
                    <LucidePreview name={name} size={20} />
                  </Flex>
                </Button>
              </Tooltip>
            )
          })}
        </Grid>
      )}
    </Stack>
  )
}
