'use strict'

'use strict'

/**
 * Stacks are like portals and allow to inject content into a section
 * in a layout or view from a different view (like a partial).
 *
 * @param {String} name
 * @param {Object} context
 *
 * @returns {String} the stack’s content
 */
export default function stack (name: string, context: any): string {
  if (!context) {
    throw new Error('Provide a name when using the "stack" handlebars helper.')
  }

  const stacks = context.data.root.stacks || {}
  const stack = stacks[name] || []

  const content = stack
    .reduce((carry: string[], { mode, data }: { mode: string, data: string }) => {
      if (mode === 'append') {
        carry.push(data)
      }

      if (mode === 'prepend') {
        carry.unshift(data)
      }

      return carry
      // @ts-expect-error
    }, [context.fn(this)])
    .join('\n')

  return content
}
