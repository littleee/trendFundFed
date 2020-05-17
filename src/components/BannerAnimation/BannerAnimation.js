import React from 'react';
import './BannerAnimation.css';

export const BannerAnimation = () => {

  const RenderList = () => {
    const arr = [];
    for (let i = 0; i < 100; i++){
      arr.push(
        <div className="wave" key={i}>
          <div className="wave_fade">
            <div className="wave_translate">
              <div className="wave_skew">
                <div className="wave_graphic"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return arr
  }

  return (
    <div className="sea">
      {
        <RenderList />
      }
    </div>
  )
}
