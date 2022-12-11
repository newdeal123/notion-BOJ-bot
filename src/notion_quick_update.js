//import { Client } from "@notionhq/client"
const {Client} = require("@notionhq/client")
const axios = require('axios');
const notion = new Client({ auth: process.env.NOTION_KEY })

const team_database_id= process.env.TEAM_DATABASE_ID
const boj_database_id = process.env.BOJ_DATABASE_ID


exports.handler = async (event) => {
  try {
        const boj_database_query = await notion.databases.query({
          database_id: boj_database_id
        })
        for(let boj_results of boj_database_query["results"]){
          const boj_page_id = boj_results['id']
          const boj_page_query = await notion.pages.retrieve({ page_id: boj_page_id });
          const boj_page_name = boj_page_query["properties"]["이름"]["title"][0]["plain_text"]; //서청운
          const boj_handle = boj_page_query["properties"]["handle"]["rich_text"][0]["plain_text"]; //newdeal
          
          const boj_inf = await axios.get(`https://solved.ac/api/v3/user/show?handle=${boj_handle}`,
          {
            headers:{
              'Content-Type': 'application/json'
            }
          });
          const nowSolvedCount = boj_inf['data']['solvedCount']; //1830
          const tier = boj_inf['data']['tier']; //22
          
          console.log(boj_handle);
          console.log(boj_page_name);
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
          
          console.log("boj_page_name "+JSON.stringify(boj_page_name))
          const response = await notion.pages.update({
            page_id: boj_page_id,
            properties: {
              '푼 모든 문제 수': {
                number: nowSolvedCount,
              },
              '티어': {
                "select": {
                    "id": tier_id
                }   
                }
            },
          });
        }
    
    
  } catch (error) {
    console.error(error.body)
  }
}

