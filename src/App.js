import React from 'react';
import { ReactiveBase, DataSearch, ReactiveList, SingleRange, MultiList, DynamicRangeSlider, SingleList  } from '@appbaseio/reactivesearch';

import { nav, container, leftCol, rightCol, search, logo} from './styles';

import './styles/search.css';

var numeral = require('numeral');

class App extends React.Component{
  constructor(props){
    super(props);
  }

  componentDidMount(){
      console.log()
  }

  customQuery = (value) => {
    console.log(value);
    if (!value) return;

    return {
      "query": {
        "match": { "NOMBRE_COMPLETO": value }
      },
      "size":0,
      /*
      "aggs":{
        "NOMBRE_COMPLETO":{
          "terms":{
            "field":"NOMBRE_COMPLETO",
            "size":100,
            "order":{
              "_count":"desc"
            }
          }
        }
      }
      */
     "sort": [
        {
          "_timestamp": {
            "order": "desc"
          }
        }
      ]
    }
  }

  render(){
    let indexSearch = "mirex-nominas-personal-2018-2020,mopc-nominas-personal-2020,map-nominas-personal-2020";
    return (
      <div className={container}>
        <ReactiveBase
          app={ indexSearch }
          url={`${process.env.REACT_APP_ELASTICSEARCH_ENDPOINT}`}
          transformRequest={props => {
            let new_url = `${process.env.REACT_APP_ELASTICSEARCH_ENDPOINT}/${indexSearch}/_msearch?`;
            let token = Buffer.from(`${process.env.REACT_APP_ELASTICSEARCH_USER}:${process.env.REACT_APP_ELASTICSEARCH_PWD}`, 'utf8').toString('base64');
            props.headers['Authorization'] = `Basic ${token}`;
            return {
              ...props,
              url: new_url
            };
          }}
          theme={{
            colors: {
              primaryColor: '#1d3557',
            },
          }}
        >
          <nav className={nav}>
            <DataSearch componentId="SearchSensor" 
              dataField='NOMBRE_COMPLETO'
              enableQuerySuggestions={true} 
              //customQuery={this.customQuery}
              showClear={true} 
              className={search}
            />
          </nav>

          <div className={leftCol}>

            <SingleList 
              showSearch={false}
              componentId="MinisterioSensor" 
              dataField="MINISTERIO" 
              title="Busca por Ministerio" />

            <DynamicRangeSlider 
              componentId="SueldoBaseSensor" 
              title="Filtra port Sueldo Base" 
              dataField="SUELDO_BRUTO" />

            <div style={{ height: '0.1px' }}></div>

            <SingleList 
              showSearch={false}
              componentId="AnoSensor" 
              dataField="ANO" 
              defaultValue="2020"
              title="Busca por Ano" />

            <div style={{ height: '0.1px' }}></div>

            <SingleList 
              componentId="CargoSensor" 
              dataField="CARGO" 
              title="Busca por Cargo" />

            <div style={{ height: '0.1px' }}></div>

            <SingleList 
              componentId="TipoEmpleado" 
              dataField="TIPO_DE_EMPLEADO" 
              title="Busca por Tipo Empleado" />
            
          </div>
          
          <ReactiveList
            componentId="SearchResult"
            className={rightCol}
            dataField="NOMBRE_COMPLETO"
            renderResultStats = {
              function(stats) {
                //console.log(stats);
                let resultStatsHTML = `Showing ${stats.displayedResults} of total ${stats.numberOfResults} in ${stats.time} ms`;
                  return resultStatsHTML;
              }
            }     
            showResultStats={false}         
            pagination
            react={{
                and: ['SearchSensor','TipoEmpleado','SueldoBaseSensor','MinisterioSensor','CargoSensor','AnoSensor'],
            }}
            render={({ data }) => (
                <ReactiveList.ResultCardsWrapper>
                    {
                      data.length > 0 &&
                      data.map(( item, i) => {
                      console.log(item);
                      let result = item;
                      return(
                        <div style={{ width: '100%' }} key={`card_${i}}`}>
                          <div className="courses-container col-xs-6">
                              <div className="course">
                                  <div className="course-preview">
                                      <h6>{ result.MINISTERIO }</h6>
                                      <h2>{ result.NOMBRE_COMPLETO }</h2>
                                      {/**<a href="#">View all details <i className="fas fa-chevron-right"></i></a> */}
                                  </div>
                                  <div className="course-info">
                                      <h6>{ result.DEPARTAMENTO }</h6>
                                      <pre><ul>
                                          <li><b>Cargo:</b> { result.CARGO }</li>
                                          <li><b>Fecha Designacion:</b> { result.INICIO !== '00/00/0000' ? result.INICIO : result.MES ? result.MES+"/"+result.ANO : result.ANO }</li>
                                          <li><b>Fecha Termino:</b> { result.TERMINO }</li>
                                          { result.NIVEL_ESCOLAR ? (<li><b>Nivel Escolar:</b> { result.NIVEL_ESCOLAR }</li>) : '' }
                                          <li><b>Tipo Empleado:</b> { result.TIPO_DE_EMPLEADO }</li>
                                          <li><b>Fuente:</b> <a href={ result.FUENTE } target="_blank">Portal Transparencia</a></li>
                                          {/**
                                           * <li><b>Sueldo Neto:</b> { numeral(result.SUELDO_NETO).format('0,0.00') }</li>
                                          <li><b>Tipo Cargo:</b> { result.TIPO_DE_CARGO }</li>
                                           */}
                                      </ul></pre>
                                      <button className="btn">RD$ { numeral(result.SUELDO_BRUTO).format('0,0.00') }</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                      )
                    })}
              </ReactiveList.ResultCardsWrapper>
          )}
      />

        
      </ReactiveBase>
	</div>  
    );
  }
}

export default App;
