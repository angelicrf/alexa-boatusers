exports.handeler = (thisAccess) => {
  return new Promise((resolve, reject) => {
    try {
      return resolve(thisAccess);
    } catch (error) {
      return reject(error);
    }
  });
};
