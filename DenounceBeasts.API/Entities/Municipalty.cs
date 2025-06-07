
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.API.Entities
{
    //attribute to map the class to a database table
    //[Table("MUNICIPALTY")] 
    public class Municipality
    { 
        // int _Id;

        //public int Id
        //{
        //    get { return _Id; }
        //    set { _Id = value; }
        //}



        public int Id { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        [StringLength(50)]
        public string Code { get; set; } 
        //dataanotations for mapping the property to a column in the database
        // [Column("MunicipaltyName")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        //public virtual List<Sector> Sectors { get; set; }
        public virtual ICollection<Sector> Sectors { get; set; }

    }
}

