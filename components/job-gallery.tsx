"use client";

import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import { asset } from "@/lib/images";

export type JobPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export function JobGallery({ photos }: { photos: JobPhoto[] }) {
  const [index, setIndex] = useState(-1);
  const slides = photos.map((photo) => ({
    src: asset(photo.src),
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
  }));

  return (
    <div className="mt-10 [&_img]:rounded-2xl [&_img]:shadow-card">
      <RowsPhotoAlbum
        photos={slides}
        spacing={12}
        targetRowHeight={240}
        defaultContainerWidth={1120}
        onClick={({ index: photoIndex }) => setIndex(photoIndex)}
      />
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        carousel={{ finite: photos.length < 3 }}
      />
    </div>
  );
}
