var Identity = {
  getUnique(baseID, inList, max=-1) {
    let tryCount = 0;
    let tryID = baseID;
    while (inList[tryID] && (max < 0 || tryCount < max)) {
      tryID = baseID+'-'+(++tryCount);
    }
    if (max >= 0 && inList[tryID]) {
      return undefined;
    }
    return tryID;
  }
};
export default Identity;
