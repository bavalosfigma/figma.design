export const wipBackgrounds = [
  { id: 'white', label: 'White', color: '#ffffff', mark: '#e2e2e2' },
  { id: 'gray', label: 'Gray', color: '#e2e2e2', mark: '#c7f8fb' },
  { id: 'lime', label: 'Lime', color: '#e4ff97', mark: '#ffffff' },
  { id: 'mint', label: 'Mint', color: '#f3ffe3', mark: '#e2e2e2' },
  { id: 'cyan', label: 'Cyan', color: '#c7f8fb', mark: '#721c1c' },
  { id: 'maroon', label: 'Maroon', color: '#721c1c', dark: true, mark: '#c7f8fb' },
]

export function wipBackgroundById(id) {
  return wipBackgrounds.find((swatch) => swatch.id === id) ?? wipBackgrounds[0]
}
