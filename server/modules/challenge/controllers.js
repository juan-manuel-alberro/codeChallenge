import jwt from 'jsonwebtoken';
import * as config from '../../config';
import fs from 'fs';


import Challenge from '../../models/challenge';

export function verifyToken(req, res, next) {
  const token = req.query.token;
  if (!token) {
    return res.status(404).json({ result: 'error', error: 'missing_parameter' });
  }
  req.token = token; // eslint-disable-line no-param-reassign
  return next();
}

export function decodeToken(req, res, next) {
  const token = req.token;
  const key = config.default.secretKey;
  jwt.verify(token, key, (err, payLoad) => {
    if (err) {
      return res.status(500).json({ result: 'error', error: 'internal_error' });
    }
    req.payLoad = payLoad; // eslint-disable-line no-param-reassign
    return next();
  });
}

export function verifyPayLoad(req, res, next) {
  const challengeAttemptId = req.payLoad.challengeAttemptId;
  const challengeId = req.payLoad.challengeId;
  const userFullName = req.payLoad.userFullName;
  if (!challengeAttemptId || !challengeId || !userFullName) {
    return res.status(404).json({ result: 'error', error: 'challenge_not_found' });
  }
  req.challengeAttemptId = challengeAttemptId; // eslint-disable-line no-param-reassign
  req.challengeId = challengeId; // eslint-disable-line no-param-reassign
  req.userFullName = userFullName; // eslint-disable-line no-param-reassign
  return next();
}

const loadChallenge = async (req, res, next) => {
  const challengeDoc = await Challenge.findById(req.challengeId);
  if (!challengeDoc) {
    return res.status(404).json({ result: 'error', error: 'challenge_NOT_found' });
  }
  req.challengeDoc = challengeDoc; // eslint-disable-line no-param-reassign
  return next();
};


export function readChallengeDir(req, res, next) {
  const challengeFolderName = req.challengeDoc.folderName;
  fs.readdir(`${__dirname}/../../../challenges_data/${challengeFolderName}`, (err, result) => {
    if (err) {
      return res.status(404).json({ result: 'error', error: 'challenge_not_found_READING_DIR' });
    }
    req.fileDir = result; // eslint-disable-line no-param-reassign
    return next();
  });
}


export function readChallengeJson(req, res, next) {
  const challengeFolderName = req.challengeDoc.folderName;
  fs.readFile(`${__dirname}/../../../challenges_data/${challengeFolderName}/challenge.json`, 'utf8', (err, content) => {
    if (err) {
      return res.status(404).json({ result: 'error', error: 'challenge_not_found' });
    }
    const challengeJson = JSON.parse(content);
    if (!challengeJson.name || !challengeJson.description) {
      return res.status(404).json({ result: 'error', error: 'challenge_not_found' });
    }
    req.challengeName = challengeJson.name; // eslint-disable-line no-param-reassign
    req.challengeDescription = challengeJson.description; // eslint-disable-line no-param-reassign
    return next();
  });
}

export function sendChallengeResponse(req, res) {
  const numberOfSteps = req.fileDir.filter((element) => {
    return element !== 'challenge.json';
  });
  res.status(200).json({
    result: 'ok',
    error: '',
    userFullName: req.userFullName,
    challengeId: req.challengeId,
    challengeName: req.challengeName,
    challengeDescription: req.challengeDescription,
    numberOfSteps: numberOfSteps.length,
  });
}

export { loadChallenge };
