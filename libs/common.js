module.exports = {
  findByAttribute(condition, modal) {
    return new Promise((resolve) => {
      try {
        return modal.findOne(condition, (error, data) =>
          resolve({ error, data })
        );
      } catch (ex) {
        console.error(ex);
        return resolve({ error: ex, data: null });
      }
    });
  },
  updateByAttributes(condition, valueObj, modal) {
    return new Promise((resolve) =>
      modal.updateOne(condition, { $set: valueObj }, (error, data) =>
        resolve({ error, data })
      )
    );
  },
  pushDoc(condition, valueObj, modal) {
    return new Promise((resolve) =>
      modal.updateOne(condition, { $push: valueObj }, (error) =>
        resolve({ error })
      )
    );
  },
  setDoc(condition, valueObj, modal) {
    return new Promise((resolve) =>
      modal.updateOne(condition, { $set: valueObj }, (error) =>
        resolve({ error })
      )
    );
  },
  pullDoc(condition, valueObj, modal) {
    return new Promise((resolve) =>
      modal.findOneAndUpdate(condition, { $pull: valueObj }, (error) =>
        resolve({ error })
      )
    );
  },
  totalItems(match, modal) {
    return new Promise((resolve) => {
      modal
        .aggregate([
          { $match: match },
          { $group: { _id: null, total: { $sum: 1 } } },
        ])
        .exec((error, response) => {
          if (error || response.length === 0) return resolve({ total: 0 });
          return resolve({ total: response[0].total });
        });
    });
  },
  queryExecutor(objParams, Modal) {
    return new Promise((resolve) => {
      const {
        match = {},
        matchCallback = {},
        group = {},
        skip = 0,
        limit = 0,
        sort = {},
        sample = {},
        addFields = {},
        project = {},
        unwind = null,
        lookup = {},
      } = objParams;
      const condition = [];

      if (Object.keys(match).length > 0) {
        condition.push({ $match: match });
      }
      if (Object.keys(lookup).length > 0) {
        condition.push({ $lookup: lookup });
      }
      if (unwind) {
        condition.push({ $unwind: unwind });
      }
      if (Object.keys(matchCallback).length > 0) {
        condition.push({ $match: matchCallback });
      }
      if (Object.keys(project).length > 0) {
        condition.push({ $project: project });
      }
      if (Object.keys(group).length > 0) {
        condition.push({ $group: group });
      }
      if (skip > 0) {
        condition.push({ $skip: skip });
      }
      if (limit > 0) {
        condition.push({ $limit: limit });
      }
      if (Object.keys(sort).length > 0) {
        condition.push({ $sort: sort });
      }
      if (Object.keys(sample).length > 0) {
        condition.push({ $sample: sample });
      }
      if (Object.keys(addFields).length > 0) {
        condition.push({ $addFields: addFields });
      }

      return Modal.aggregate(condition).exec((error, response) =>
        resolve({
          response: error || response.length === 0 ? [] : response,
        })
      );
    });
  },
};
