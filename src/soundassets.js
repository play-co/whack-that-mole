import Sound;

var sound_group;

exports.get = function () { return sound_group; };

exports.init = function () {
  sound_group = new Sound({
    path: 'resources/sounds',
    files: {
      levelmusic: {
        path: 'music',
        volume: 0.5,
        background: true,
        loop: true
      },
      whack: {
        path: 'effect',
        background: false
      },
      pop: {
        path: 'effect',
        background: false
      }
    }
  });
};
