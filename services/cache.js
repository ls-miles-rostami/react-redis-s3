const mongoose = require('mongoose');
const redis = require('redis');
//we are using util to turn redis client functions into real promises
const util = require('util');
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);

//turning the get method into a real promise
client.hget = util.promisify(client.hget);

//Here we are adding a function to the prototype of the Query function
// The idea is to create a flag where we can simply add a .cache() to our queries in the routes folder
// which will run this function below and set the 'useCache' to true. This will let us explicitely say which queries we want to 
// run the cache logis on. 
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this;
};

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
//Here we are saying if the useCache is false, just run the exec as normal
if(!this.useCache){
  return exec.apply(this, arguments);
}
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {collection: this.mongooseCollection.name}));
  // check to see if you have a value in redis, if we do return that
  const cacheValue = await client.hget(this.hashKey, key);

  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }
  //if not, issue the query and store the result in redis as well
  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey,key, JSON.stringify(result), 'EX', 10);
  return result

}

module.exports = {
  clearHash(hashKey){
    client.del(JSON.stringify(hashKey))
  }
}