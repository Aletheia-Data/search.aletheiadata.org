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

  render(){
    let indexSearch = "empleados-cp";
    return (
      <div className={container}>
        {/*
        <div className="in-construction">
          <img src={'./assets/img/not-available.jpg'}></img>
        </div>
        */}
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
              dataField={['NOMBRE', 'APELLIDO']} 
              enableQuerySuggestions={true} 
              showClear={true} 
              className={search}
            />
          </nav>

          <div className={leftCol}>
            <SingleList 
              componentId="TipoEmpleado" 
              dataField="TIPO_EMPLEADO" 
              title="Busca por Tipo Empleado" />

            <DynamicRangeSlider 
              componentId="SueldoBaseSensor" 
              title="Filtra port Sueldo Base" 
              dataField="SUELDO_BASE" /><div style={{ height: '1px' }}></div>

            <SingleList 
              showSearch={false}
              componentId="CatEmpleado" 
              dataField="CATEGORIA_CARGO" 
              title="Busca por Categoria" />

            <SingleList 
              showSearch={false}
              componentId="NivelEscolarEmpleado" 
              dataField="NIVEL_ESCOLAR" 
              title="Busca por Nivel Escolar" />
            
          </div>
          
          <ReactiveList
            componentId="SearchResult"
            className={rightCol}
            dataField={["NOMBRES", "APELLIDO"]}
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
                and: ['SearchSensor', 'TipoEmpleado', 'CatEmpleado', 'SueldoBaseSensor', 'NivelEscolarEmpleado' ],
            }}
            render={({ data }) => (
                <ReactiveList.ResultCardsWrapper>
                    {
                      data.length > 0 &&
                      data.map(( item, i) => {
                      //console.log(item);
                      let result = item;
                      return(
                        <div style={{ width: '100%' }} key={`card_${i}}`}>
                          <div className="courses-container col-xs-6">
                              <div className="course">
                                  <div className="course-preview">
                                      <h6>{ result.CATEGORIA_CARGO }</h6>
                                      <h2>{ result.NOMBRE } { result.APELLIDO }</h2>
                                      {/**<a href="#">View all details <i className="fas fa-chevron-right"></i></a> */}
                                  </div>
                                  <div className="course-info">
                                      <h6>{ result.INSTITUCION }</h6>
                                      <pre><ul>
                                          <li><b>Descargo:</b> { result.DESCCARGO }</li>
                                          <li><b>Fecha Designacion:</b> { result.FECHA_DESIGNACION }</li>
                                          <li><b>Fecha Primer Cargo:</b> { result.FECHA_PRIMER_CARGO }</li>
                                          <li><b>Nivel Escolar:</b> { result.NIVEL_ESCOLAR }</li>
                                          <li><b>Sueldo Neto:</b> { numeral(result.SUELDO_NETO).format('0,0.00') }</li>
                                          <li><b>Tipo Cargo:</b> { result.TIPO_DE_CARGO }</li>
                                          <li><b>Tipo Carrera:</b> { result.TIPO_DE_CARRERA }</li>
                                          <li><b>Tipo Empleado:</b> { result.TIPO_EMPLEADO }</li>
                                      </ul></pre>
                                      <button className="btn">RD$ { numeral(result.SUELDO_BASE).format('0,0.00') }</button>
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
