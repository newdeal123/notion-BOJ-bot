//import { Client } from "@notionhq/client"
const {Client} = require("@notionhq/client")
const axios = require('axios');
const notion = new Client({ auth: process.env.NOTION_KEY })

const team_database_id= process.env.TEAM_DATABASE_ID
const boj_database_id = process.env.BOJ_DATABASE_ID


exports.handler = async (event) => {
  try {
    // const query = await notion.databases.retrieve({
    //     database_id: team_database_id
    // })
    const query = await notion.databases.query({
        database_id: team_database_id
    })
    for(let results of query["results"]){
        const page_id = results['id']
        const page_query = await notion.pages.retrieve({ page_id: page_id });
        const boj_handle = page_query['properties']["BOJ handle"]["rich_text"][0]["plain_text"]; //newdeal
        const user_name = page_query["properties"]["이름"]["title"][0]["plain_text"]; //서청운

        console.log(boj_handle);
        console.log(user_name);

        const inf_page = await notion.databases.retrieve({ database_id: boj_database_id }); 
        
        console.log(inf_page);

        const boj_database_query = await notion.databases.query({
          database_id: boj_database_id
        })
        //console.log(boj_database_query["results"])
        let already_in = false
        for(let boj_results of boj_database_query["results"]){
          const boj_page_id = boj_results["id"]
          const boj_page_query = await notion.pages.retrieve({ page_id: boj_page_id });
          const boj_page_name = boj_page_query["properties"]["이름"]["title"][0]["plain_text"];
          
          if(boj_page_name==user_name) already_in=true;
        }

        if(already_in) continue;

        const boj_inf = await axios.get(`https://solved.ac/api/v3/user/show?handle=${boj_handle}`,
          {
            headers:{
              'Content-Type': 'application/json'
            }
          });
        const solvedCount = boj_inf['data']['solvedCount']; //1830
        const rating = boj_inf['data']['rating']; 
        const tier = boj_inf['data']['tier']; //22
        console.log(solvedCount);
        console.log(tier)
        
        let tier_id;
        const tier_num=[{"number":21,"id":"`Bvx"},{"number":16,"id":"GEUY"},{"number":13,"id":"sYYs"},{"number":11,"id":"yDBu"},{"number":6,"id":"bPdS"},{"number":0,"id":"pVwR"}];
        for(let i of tier_num){
          const number=i["number"];
          const id=i["id"];
          if(tier>=number) {
              tier_id=id;
              break;
          }
        }
        const response = await notion.pages.create({
          "parent": {
            "type": "database_id",
            "database_id": boj_database_id
          },
          "properties":{
            "이름": {
              "title": [
                {
                  "type": "text",
                  "text": {
                    "content": user_name
                  }
                }
              ]
            },
            '푼 모든 문제 수': {
              number: solvedCount,
            },
            '지난 주 푼 문제 수': {
              number: solvedCount,
            },
            '목표 문제 수': {
              number: 10,
            },
            'handle': {
              "rich_text" : [
                {
                    "type": "text",
                    "text": {
                        "content": boj_handle
                    }
                }
              ]
            },
            '티어': {
              "select": {
                  "id": tier_id
              }   
            }
          }
        });
        
        console.log(response);

    }
  } catch (error) {
    console.error(error.body)
  }
  
}
