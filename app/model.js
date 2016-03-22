"use strict";

const app = require('./app');
const db = app.db;

var _models = {};

/**
 * Model Factory class.
 * For making those mongoose models.
 */
class ModelFactory
{
    constructor(name,schema)
    {
        this.name = name;
        this.schema = new db.Schema(schema);

        // Expose to API?
        this.expose = true;

        this.range('_id',1);
        this.population = [];

        _models[name.toLowerCase()] = this;
    }

    /**
     * Add methods to the model.
     * @param object
     * @returns {ModelFactory}
     */
    methods(object)
    {

        for(let method in object)
        {
            this.schema.methods[method] = object[method];
        }
        return this;
    }

    /**
     * Set the range key and sort value.
     * @param key string
     * @param sort int
     * @returns {ModelFactory}
     */
    range(key,sort)
    {
        this.key = key;
        this.sort = sort || 1;
        this.keyType = this.schema.tree[this.key].type;
        return this;
    }

    /**
     * Population settings for this model.
     * @param args array|object
     * @returns {ModelFactory}
     */
    populate(args)
    {
        this.population = args||[];
        return this;
    }

    /**
     * Assign the schema to the model.
     * @returns {ModelFactory}
     */
    done()
    {
        this.model = db.model(this.name,this.schema);
        ModelFactory[this.name] = this.model;

        return this;
    }

    /**
     * Alias for getting schema type.
     * @param name
     * @returns {*}
     */
    static type(name)
    {
        return db.Schema.Types[name];
    }

    /**
     * Return a ModelFactory object.
     * @param name string
     * @returns {*|null}
     */
    static get(name)
    {
        return _models[name] || null;
    }

    /**
     * Named constructor.
     * @param name string
     * @param schema object
     * @returns {ModelFactory}
     */
    static create(name, schema)
    {
        return new ModelFactory(name,schema);
    }
}

module.exports = ModelFactory;