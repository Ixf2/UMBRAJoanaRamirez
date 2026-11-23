import { useState } from 'react'

export default function Portrait({ character, ...props }) {
  const [failedImages, setFailedImages] = useState([])

  const portraits = [
    '/images/elara-valen.webp',
    '/images/kael-grim.webp'
  ]

  const uploadedImage = character.imageDataUrl || character.image || ''
  const presetImage = portraits[Number(character.portrait)] || ''

  const image = [uploadedImage, presetImage].find(
    source => source && !failedImages.includes(source)
  )

  if (!image) {
    return (
      <div
        className="character-portrait portrait-placeholder"
        role="img"
        aria-label={`Iniciales de ${character.name}`}
        {...props}
      >
        <span aria-hidden="true">
          {String(character.name || '')
            .split(' ')
            .filter(Boolean)
            .map(word => word[0])
            .slice(0, 2)
            .join('')}
        </span>
      </div>
    )
  }

  return (
    <img
      className="character-portrait"
      src={image}
      alt={`Retrato de ${character.name}`}
      width="400"
      height="400"
      onError={() =>
        setFailedImages(previous =>
          previous.includes(image)
            ? previous
            : [...previous, image]
        )
      }
      style={{
        objectPosition: character.imagePosition || 'center'
      }}
      {...props}
    />
  )
}
