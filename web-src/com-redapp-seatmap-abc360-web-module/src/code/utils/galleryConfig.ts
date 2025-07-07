import { IMediaData } from '../components/seatMap/hooks/useSeatmapMedia';

export function getGalleryConfig(media: IMediaData | null) {
  if (!media) return null;

  return {
    title: ' ',
    styles: {
      modal: {
        width: "100vw", // 600
        height: "100vh", // 500
        borderRadius: 2,
        padding: '15px 25px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
      },
      slides: {
        width: "100%", // 550 
        height: "60vh", // 300
      },
      thumbnails: {
        width: "20vw", // 110
        height: "20vh", // 85
      },
    },
    closeButton: {
      enabled: false
    },
    pagination: {
      enabled: true,
      activeBulletColor: 'black', // #39c0ec
    },
    navigation: {
      enabled: true,
      color: 'gray', // #39c0ec
    },
    photoData: media.photoData || [],
    panoData: media.panoData || [],
  };
}