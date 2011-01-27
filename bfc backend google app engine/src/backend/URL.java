package backend;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class URL {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    private String URL;
    
    @Persistent
    private boolean failed;
    
    public URL(String URL, boolean failed){
    	this.URL = URL;
    	this.failed = failed;
    } 

    public String toString(){
    	return URL;
    }

}
