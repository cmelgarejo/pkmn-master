# pkmn-master
Fun little project to test the capabilities of making a serverless app - https://webtask.io

## Preface

To create your own live service you can follow the instructions in this neat article by the Auth0 Team

https://auth0.com/blog/if-this-then-node-dot-js-extending-ifttt-with-webtask-dot-io/

## TL;DR

1) Clone the repo

2) Register a https://webtask.io account

3) Register a https://mlab.com account

4) Create a new database @mlab.com and copy the connection string

5)
```
$ npm i -g wt-cli
$ wt init
$ wt create pokemongo.js --secret=MONGO_URL=<mlab connection string> #(copy the url wt gives you)
$ wt create pokemap.js --secret=MONGO_URL=<mlab connection string> #(copy this url also)
```

6) Fire up [Postman](https://www.getpostman.com/) and grab this [collection](https://www.getpostman.com/collections/9b59afbea219d70f5df4), you can try my own server, but Start up postman and you should put your url's in each and try the links! :D

And now, for the fun part:

Grab this [Recipe](https://ifttt.com/recipes/455556-find-pokemon-near-my-position) and put your in server, download the [IFTTT](https://ifttt.com) app and have fun! :+1:

```
{
  "username": "cmelgarejo", // <- You have to setup your own username
  "distkm": 1, //<- the distance of the bounding rectangle to look up the pokemon
  "gmaps": "https://maps.google.com/?ll=-34.574,-58.459&z=21" <- this address will be provided by the ifttt API
}
```
