import { IMediaData } from '../components/seatMap/hooks/useSeatmapMedia';

export function getGalleryConfig(media: IMediaData | null) {
  if (!media) return null;

  return {
    title: media.title || 'Aircraft gallery',
    styles: {
      modal: {
        width: 600,
        height: 500,
        borderRadius: 2,
        padding: '15px 25px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
      },
      slides: {
        width: 550,
        height: 300,
      },
      thumbnails: {
        width: 130,
        height: 100,
      },
    },
    closeButton: {
      enabled: false
    },
    pagination: {
      enabled: true,
      activeBulletColor: '#39c0ec',
    },
    navigation: {
      enabled: true,
      color: '#39c0ec',
    },
    photoData: media.photoData || [],
    panoData: media.panoData || [],
  };
}