import { defineType, defineField } from 'sanity'
import { WarningOutlineIcon } from '@sanity/icons'

export const legalTodo = defineType({
  name: 'legalTodo',
  title: 'Zone à compléter (client)',
  type: 'object',
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Consigne',
      description: 'Contenu à fournir par le client. Rendu dans un encadré distinctif sur le site.',
      type: 'text',
      rows: 3,
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { text: 'text' },
    prepare: ({ text }) => ({
      title: text ? text.slice(0, 80) : '(consigne vide)',
      subtitle: 'À compléter par le client',
    }),
  },
})
