import Icon from '#/components/Icon'
import { hexToRgba } from '#/lib/catalog'
import { collectionLogo } from '#/lib/collection-logos'
import { contrastSafeFill } from '#/lib/publisher-logos'

type CollectionTileProps = {
  collection: { id: string; icon: string; color: string }
  /** Classes de taille/rayon de la pastille (ex. "h-11 w-11 rounded-[11px]"). */
  box: string
  /** Taille du glyphe en px. */
  glyph: number
}

/**
 * Pastille d'une collection : logo officiel de la techno (Spring Boot, FastAPI,
 * React…) quand disponible, sinon l'icône Phosphor générique.
 */
export default function CollectionTile({ collection, box, glyph }: CollectionTileProps) {
  const logo = collectionLogo(collection.id)
  const color = logo?.color ?? collection.color

  return (
    <span
      className={`grid flex-none place-items-center ${box}`}
      style={{ background: hexToRgba(color, 0.14), color: contrastSafeFill(color) }}
    >
      {logo?.asset ? (
        <img
          src={logo.asset}
          alt=""
          width={glyph}
          height={glyph}
          loading="lazy"
          decoding="async"
          className="inline-block shrink-0 rounded-[3px] object-contain"
          aria-hidden="true"
        />
      ) : logo?.path ? (
        <svg
          viewBox="0 0 24 24"
          width={glyph}
          height={glyph}
          fill="currentColor"
          aria-hidden="true"
          className="inline-block shrink-0"
        >
          <path d={logo.path} />
        </svg>
      ) : (
        <Icon name={collection.icon} bold size={glyph} />
      )}
    </span>
  )
}
