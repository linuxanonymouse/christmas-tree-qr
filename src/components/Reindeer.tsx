import React from 'react';

const Reindeer: React.FC = () => {
  return (
    <div className="deer-container">
      <div className="artboard">
        <div className="deer">
          <div className="rocking">
            <div className="head">
              <div className="horns">
                <div className="horn horn-left">
                  <div className="line line-one"></div>
                  <div className="line line-two"></div>
                  <div className="line line-three"></div>
                </div>
                <div className="horn horn-right">
                  <div className="line line-one"></div>
                  <div className="line line-two"></div>
                  <div className="line line-three"></div>
                </div>
              </div>
              <div className="ears">
                <div className="ear ear-left"></div>
                <div className="ear ear-right"></div>
              </div>
              <div className="eyes">
                <div className="eye eye-left"></div>
                <div className="eye eye-right"></div>
              </div>
              <div className="nose"></div>
            </div>
            <div className="body">
              <div className="shadow"></div>
              <div className="hooves">
                <div className="hoof-one">
                  <div className="line"></div>
                  <div className="anim-part">
                    <div className="circle">
                      <div className="circle">
                        <div className="circle">
                          <div className="circle">
                            <div className="circle circle-last"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hoof-two">
                  <div className="line-one"></div>
                  <div className="line-two"></div>
                </div>
              </div>
            </div>
            <div className="tail">
              <div className="circle">
                <div className="circle">
                  <div className="circle">
                    <div className="circle">
                      <div className="circle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="legs">
            <div className="leg-left">
              <div className="anim-part">
                <div className="line"></div>
              </div>
            </div>
            <div className="leg-right">
              <div className="anim-part">
                <div className="circle">
                  <div className="circle">
                    <div className="circle">
                      <div className="circle">
                        <div className="circle">
                          <div className="circle">
                            <div className="circle">
                              <div className="circle">
                                <div className="circle circle-last"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="presents">
          <div className="present present-one"></div>
          <div className="present present-two"></div>
          <div className="present present-two present-two-right"></div>
          <div className="present present-three"></div>
        </div>
      </div>
    </div>
  );
};

export default Reindeer;
