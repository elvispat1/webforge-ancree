<script setup lang="ts">
// Bloc d'article rich-text (_type "rich-text"). Typé contre le bloc discriminé
// (ArticleRichTextBlock = BlockBase<'rich-text'> & ArticleRichTextContent), même
// mécanique que les blocs réguliers. La forme des entrées (RichTextEntry: kind
// paragraph | heading | list) vit dans content/article-blocks.ts. _type et _key
// déclarés en props pour éviter le fallthrough d'attributs (v-bind de
// l'orchestrateur).
import type { ArticleRichTextBlock } from '~/types/blocks'

defineProps<ArticleRichTextBlock>()
</script>

<template>
  <!-- Corps de texte riche d'un article. Itère sur `blocks` et rend chaque entrée
       selon son `kind`. La mesure de lecture est déjà contrainte par la page;
       ce bloc remplit la colonne et ne fixe aucun max-width. Le rythme vertical
       (paragraphe, sous-titre avec plus d'air avant, liste) est porté par les
       classes wf-article-rich-text* en CSS via tokens. -->
  <div class="wf-article-rich-text">
    <template v-for="(block, index) in blocks" :key="index">
      <h2
        v-if="block.kind === 'heading'"
        class="wf-h3 wf-article-rich-text-heading"
      >
        {{ block.text }}
      </h2>
      <ul
        v-else-if="block.kind === 'list'"
        class="wf-article-rich-text-list"
      >
        <li
          v-for="(item, i) in block.items"
          :key="i"
          class="wf-body-1"
        >
          {{ item }}
        </li>
      </ul>
      <p
        v-else
        class="wf-body-1 wf-article-rich-text-paragraph"
      >
        {{ block.text }}
      </p>
    </template>
  </div>
</template>
