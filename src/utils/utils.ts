export function parseSSEDataOnly(sseString: string): string {
  // Use a Regular Expression to find all "data:" fields
  const dataMatches = sseString.match(/data: ?(.*)/g)

  // Initialize a string to hold the concatenated data
  let dataString = ''

  // Iterate over each "data:" match, if any
  if (dataMatches) {
    for (const dataMatch of dataMatches) {
      // Extract the actual data content from the match (i.e., remove "data:")
      const dataContent = dataMatch.replace(/data: ?/, '')

      // Append the data content to the dataString, appending a newline if necessary
      if (dataContent === '') {
        // If the data content is empty, it signifies a newline should be inserted
        dataString += '\n'
      } else {
        dataString += dataContent + '\n'
      }
    }
  }

  // Remove the last newline, if any, because it was added as a separator
  if (dataString.endsWith('\n')) {
    dataString = dataString.slice(0, -1)
  }

  return dataString
}

export function stripEndTokens(text: string): string {
  const newText = text.replace(/<\/s>$/, '')
  return newText
}
