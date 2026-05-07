import { Builder } from "./builder.js";
import { graphql } from "./graphql.js";

export class ModelSource extends Builder  {
    whereCondition={
        AND:[{OR:[]}],
    };
    orderBy=[];
    setReturnType(returnType){
        this.returnType = returnType;
    }

    async find(identifier){
        try {
            let res = await graphql({
                query:this.schema.find,
                variables:{
                    id:identifier
                }
            })
            let data = res?.data[this.modelName.toLowerCase()]
            this.fill(data);
            this.id = data?.id ?? null;
        }catch(e){
            throw new Error(e.message);
        }
            
    }

    async update(){
        try{
            let res = graphql({
                query:this.schema.update,
                variables:{
                    id:this.id,
                    input:this.readyInput()
                }
            })
            return res;
        }catch(e){
            throw new Error(e.message);
        }
    }

    async create(){
        try{
            let res = graphql({
                query:this.schema.create,
                variables:{
                    input:this.readyInput()
                }
            })
            return res;
        }catch(e){
            throw new Error(e.message);
        }
    
    }


    async delete(identifier){
        try{
            let res = graphql({
                query:this.schema.delete,
                variables:{
                    id:identifier
                }
            })
            return res;
        }catch(e){
            throw new Error(e.message);
        }
    }

    where (column,operator,value){
        this.whereCondition.AND.push({column:column,operator:operator,value:value})
        return this;
    }

    orWhere(column,operator,value){
        this.whereCondition.AND[0].OR.push({column:column,operator:operator,value:value})
        return this;
    }

    hasRelation(relation,column,operator,value){
        this.whereCondition.AND.push({HAS:{relation:relation,condition:{column:column,operator:operator,value:value}}});
        return this;
    }

    orHasRelation(relation,column,operator,value){
        this.whereCondition.AND[0].OR.push({HAS:{relation:relation,condition:{column:column,operator:operator,value:value}}})
        return this;
    }

    orderBy (column,order){
        this.orderBy.push({column:column,order:order})
        return this;
    }
    async get(){
        let conditions = {
            page: this.page ?? 1,
            first: this.first ?? 10,
        };
        if(this.whereCondition.AND.length > 1 || (this.whereCondition.AND[0].OR.length > 0)){
            conditions.where = this.whereCondition;
        }

        if(this.orderBy.length > 0){
            conditions.orderBy = this.orderBy;
        }


        try{
            let res = graphql({
                query:this.schema.all,
                variables:conditions
            })
            return res;
        }catch(e){
            throw new Error(e.message);
        }
    }

    fill (resource){
        this.fillables.forEach(element => {
            this[element] = resource[element] ?? undefined;
        });
    }

    readyInput(){
        console.log(this,'with this');
        let inputs = this.default ?? {};
        this.fillables.forEach(element => {
            if(this[element] == undefined){
                return;
            }
            inputs[element] = this[element]
        });
        return inputs;
    }
}


