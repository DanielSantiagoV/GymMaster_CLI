/**
 * Base de datos simple en memoria para desarrollo
 * Permite probar la aplicación sin instalar MongoDB
 */
class SimpleDatabase {
    constructor() {
        this.collections = {
            clientes: [],
            planes: [],
            contratos: [],
            seguimientos: [],
            finanzas: [],
            nutricion: []
        };
        this.counters = {
            clientes: 0,
            planes: 0,
            contratos: 0,
            seguimientos: 0,
            finanzas: 0,
            nutricion: 0
        };
    }

    /**
     * Simula conexión
     */
    async connect() {
        console.log('🔌 Conectado a base de datos en memoria (MongoDB no instalado)');
        console.log('⚠️ Los datos se perderán al cerrar la aplicación');
        return { client: this, db: this };
    }

    /**
     * Simula desconexión
     */
    async disconnect() {
        console.log('🔌 Conexión cerrada');
    }

    /**
     * Obtiene una colección
     */
    collection(name) {
        return new SimpleCollection(this.collections[name], this.counters[name]);
    }

    get client() { return this; }
    get db() { return this; }
}

/**
 * Colección simple
 */
class SimpleCollection {
    constructor(data, counter) {
        this.data = data;
        this.counter = counter;
    }

    async insertOne(doc) {
        const id = ++this.counter;
        const document = { _id: id, ...doc };
        this.data.push(document);
        return { insertedId: id };
    }

    async find(query = {}) {
        return {
            toArray: () => {
                if (Object.keys(query).length === 0) return this.data;
                return this.data.filter(doc => this.matches(doc, query));
            }
        };
    }

    async findOne(query) {
        const results = this.data.filter(doc => this.matches(doc, query));
        return results.length > 0 ? results[0] : null;
    }

    async updateOne(query, update) {
        const index = this.data.findIndex(doc => this.matches(doc, query));
        if (index !== -1) {
            if (update.$set) {
                this.data[index] = { ...this.data[index], ...update.$set };
            }
            return { modifiedCount: 1 };
        }
        return { modifiedCount: 0 };
    }

    async deleteOne(query) {
        const index = this.data.findIndex(doc => this.matches(doc, query));
        if (index !== -1) {
            this.data.splice(index, 1);
            return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
    }

    async countDocuments(query = {}) {
        if (Object.keys(query).length === 0) return this.data.length;
        return this.data.filter(doc => this.matches(doc, query)).length;
    }

    matches(doc, query) {
        for (const [key, value] of Object.entries(query)) {
            if (key === '_id') {
                if (doc._id !== value) return false;
            } else if (typeof value === 'object' && value.$ne) {
                if (doc[key] === value.$ne) return false;
            } else if (typeof value === 'object' && value.$exists) {
                if (value.$exists && !(key in doc)) return false;
                if (!value.$exists && (key in doc)) return false;
            } else {
                if (doc[key] !== value) return false;
            }
        }
        return true;
    }
}

module.exports = SimpleDatabase;
