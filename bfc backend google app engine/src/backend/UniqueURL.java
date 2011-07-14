package backend;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class UniqueURL {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    private String URL;
    
    @Persistent
    private int counter = 0;

    public UniqueURL(String URL){
    	this.URL = URL;
    	this.counter++;
    } 

    public String toString(){
    	return counter + " - " + URL;
    }
    
    public void incrementCoutner(){
    	this.counter++;
    }
	
}
