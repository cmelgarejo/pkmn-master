"use latest";

var {
    MongoClient
} = require('mongodb');
var handlebars = require('handlebars');

var View = `
<html>
  <head>
    <title>Nearby Pokemon</title>
  </head>
  <body>
    {{#if pkmn.length}}
      <h2>Pokemon near {{user}}</h2>
      <ul>
        {{#each pkmn}}
          <li>{{pokemon_name}}</li>
        {{/each}}
      </ul>
    {{else}}
      <h1>No pkmn found yet :(</h1>
    {{/if}}
  </body>
</html>
`;

return (ctx, req, res) => {
    let {
        MONGO_URL
    } = ctx.data;
    MongoClient.connect(MONGO_URL, (err, db) => {
        if (err) return res.end(err);
        db.collection('pkmn')
            .find({
                username: ctx.data.username
            })
            .toArray((err, pkmn) => {
                if (err) return res.end(err);
                const view_ctx = {
                    pkmn: pkmn.sort((pkmn1, pkmn2) => {
                        return pkmn2.count - pkmn1.count;
                    }),
                    user: ctx.data.username
                };
                const template = handlebars.compile(View);
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(template(view_ctx));
            });
    });
};
