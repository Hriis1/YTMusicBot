function isYouTubeLink(input) {
    return input.startsWith("https://www.youtube.com/watch?");
}

function isWholeNumber(input) {
    return /^\d+$/.test(input);
  }

module.exports = {
    isYouTubeLink,
    isWholeNumber
};