package backend;

import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class ConvertedURL {

	@PrimaryKey
    @Persistent
    private String key;
	
	public ConvertedURL(String key){
		this.key = key;
	}
}