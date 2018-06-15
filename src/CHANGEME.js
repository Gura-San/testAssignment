/* 
    Greetings to Remine team!
    I'll make comments to along the coding process.
    - David
 */

import React, { Component } from 'react';
import RemineTable from './components/Table/RemineTable/RemineTable';
import './bootstrap.min.css'

// Getting API obj instance from the API.js
import API from './API';

class Test extends Component {

    // Component State
    state = {
        // Data from the API
        locationData:           null,
        buildingType:           null,
        // Error handling
        loading:                true,
        error: '',
        // Filter inputs
        bathMin:                0,
        bedMin:                 0,
        bathMax:                1000,
        bedMax:                 1000,
        buildingChecked:        [],
        tempData:               [],
    }

    // Function for API calls
    // 2 simultaneous calls are being done, after that data is being populated in state 
    async getData() {
        try {
            const [locationDataRes, buildingTypeRes] = await Promise.all([
                API.getLocations(),
                API.getBuildingTypes()
            ])

            this.setState({
                locationData: locationDataRes.data,
                tempData: locationDataRes.data,
                buildingType: buildingTypeRes.data,
                loading: false,
                error: false
            })
        }
        catch (error) {
            console.log(error);
            this.setState({
                error: `${error}`,
                loading: false
            })
        }
    }


    //  Api call
    async componentDidMount() {
        await this.getData()
    }

    // Load/Error handling before the data from the API comes in.
    dataLoadHandling = _ => {
        const { tempData, loading, error } = this.state
        
        if (loading) {
            return (
                <div className="testContainer">
                    <p>Loading ...</p>
                </div>)
        }
        if (error) {
            return (
                <div className="testContainer">
                    <p>{ error }</p>
                </div>)
        } else {
            return (
                <div className="testContainer">
                    <RemineTable properties={ tempData } />
                </div>)
        }
    }

    // Checkbox state changes
    // When checkbox is clicked function checks status of it
    // and either adds or removes the value from the array
    bdTypeFilterAdd = event => {
        let checkBox = event.target.checked
        let checkBoxValue = event.target.value
        let buildingChecked = [...this.state.buildingChecked]
        let tempArr = []
        if ( checkBox ) {
            tempArr = buildingChecked.concat( checkBoxValue )
        } else {
            tempArr = buildingChecked.filter( building => { return checkBoxValue !== building } )
        }
        this.setState( { buildingChecked: [...tempArr] } )
    }

    // The min/max numbers state change
    filterNumHandler = event => {
        let val = parseInt(event.target.value)
        this.setState({
            [event.target.name]: val
        })
    }

    // Main filter function.
    // 2 filter methods applied to the copy of the current state with API data
    filter = (event) => {
        let currentData = [...this.state.locationData]
        let allowedBdTypes = [...this.state.buildingChecked]
        const {bedMin, bedMax, bathMin, bathMax} = this.state

        let filterData = currentData.filter(data => {

            return (data.beds >= bedMin && data.beds <= bedMax &&
                    data.baths >= bathMin && data.baths <= bathMax)
        })

        if (allowedBdTypes.length) {
            filterData = filterData.filter(data => {
                return allowedBdTypes.includes(data.buildingType.name)
            })
        }

        this.setState({
            tempData:   [...filterData],
            bedMin:             0,
            bedMax:             1000,
            bathMin:            0,
            bathMax:            1000,
        })
    }
    
    // Loading status handling for the check buttons
    bdTypeCheckBoxHandler = () => {
        const { buildingType, loading } = this.state
        
        if (loading) {
            return (
                <option value="">Loading</option>
            )
        } else {
            return (
                buildingType.map(bdType => (
                    <label className="col-sm-1-5" key={bdType.id} onClick={(event) => this.bdTypeFilterAdd(event)}>
                        <input type="checkbox" value={bdType.name} /> {bdType.name}
                    </label>
                ))
            )
        }
    }

    
    render() {

        return (
            <div className="testContainer">
                <div className="tableContainer">

                    <form className="form-horizontal" onSubmit={ event => { event.preventDefault(); this.filter(event) } }>
                        <div className="form-group">
                            <div className="col-sm-6">
                            <label className="col-sm-2 control-label">Bedrooms</label>
                            </div>
                            <div className="col-sm-6">
                            <label  className="col-sm-2 control-label">Bathrooms</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-3">
                            <input type="number" value={this.state.bedMin} min="0" name="bedMin" className="min form-control" placeholder="min" onChange={(event) => this.filterNumHandler(event)} />
                            </div>
                            <div className="col-sm-3">
                            <input type="number" value={this.state.bedMax} min="1" name="bedMax" className="max form-control" placeholder="max" onChange={(event) => this.filterNumHandler(event)} />
                            </div>
                            <div className="col-sm-3">
                            <input type="number" value={this.state.bathMin} min="0" name="bathMin" className="min form-control" placeholder="min" onChange={(event) => this.filterNumHandler(event)} />
                            </div>
                            <div className="col-sm-3">
                            <input type="number" value={this.state.bathMax} min="1" name="bathMax" className="max form-control" placeholder="max" onChange={(event) => this.filterNumHandler(event)} />
                            </div>
                        </div>
                        <div className="form-group">
                            { this.bdTypeCheckBoxHandler() }
                        </div>
                        <div className="form-group">
                            <button type="submit" className="btn btn-info">Filter</button>
                        </div>
                    </form>
                </div>

                { this.dataLoadHandling() }

            </div>
        );
    }
}

export default Test;
