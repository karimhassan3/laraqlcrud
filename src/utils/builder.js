export class Builder {
    schema={};

    constructor(){
        this.modelName = this.constructor.name;
        this.generateMutationSchema();
        this.generateQuerySchema()
    }

    generateMutationSchema(){
        const operations = ['create','update','delete']
        for (let operation of operations){
            let input ='';
            let insert = '';
            const operationName = operation+this.modelName;
            if(operation != 'delete'){
                input +=`$input:${this.modelName}Input!`;
                insert += 'input:$input'
            }
            if(operation == 'update'){
                input += ','
                insert += ','
            }
            if(operation != 'create'){
                input += `$id:ID!`,
                insert += 'id:$id'
            }
            let createMutation = `
                mutation ${operationName}(${input}) {
                    ${operationName}(${insert}){
                        ${this.constructor.returnType}
                    }
                }
            `
            this.schema[operation] = createMutation;
        }        
    }
    set setReturnType(returnType){
        this.constructor.returnType = returnType;
        this.generateMutationSchema();
        this.generateQuerySchema()
    }
    generateQuerySchema(){


        let queryName = this.modelName.split(/(?=[A-Z])/).map(item=> item.toLowerCase()).join("_");
        let operations = ['find','all'];
        let inputs;
        let insert;
        let structure;
        for (let operation of operations){
            if(operation == 'all'){
                queryName += 's';
                inputs = '$first: Int!, $where: WhereConditions, $page: Int!, $orderBy: [OrderByClause!]'
                insert = 'first:$first,page:$page,where:$where,orderBy:$orderBy';
                structure = `
                    paginatorInfo {
                        count
                        currentPage
                        firstItem
                        hasMorePages
                        lastItem
                        lastPage
                        perPage
                        total
                    }
                    data{
                        ${this.constructor.returnType}
                    }   
                `
            }else{
                inputs = '$id:ID!',
                insert = 'id:$id'
                structure = this.constructor.returnType;
            }
            let createQuery = `
            query ${queryName} (${inputs}){
                ${queryName} (${insert}){
                    ${structure}
                }
            }
        `
            this.schema[operation] = createQuery;
        }
        
    }


}