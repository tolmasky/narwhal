Jack.Response = function(body, status, header, block) {
    var that = this;
    
    var body = body || [],
        status = status || 200,
        header = header || {};
    
    this.status = status;
    this.header = new Jack.Utils.HeaderHash({"Content-Type" : "text/html"});
    this.header.merge(header);
    
    this.writer = function(x) { that.body.push(x); };
    this.block = null;
    this.length = 0;
    
    this.body = [];
    
    if (body.each)
    {
        body.each(function(part) {
            that.write(String(part));
        });
    }
    else if (body.toString)
        // FIXME: *all* objects response to toString...
        this.write(body.toString());
    else
        throw new Error("stringable or iterable required");
        
    if (block)
        block(this);
}

Jack.Response.prototype.write = function(str) {
    var s = String(str);
    this.length += s.length;
    this.writer(s);
    return str;
}

Jack.Response.prototype.finish = function(block) {
    this.block = block;
    
    if (this.status == 204 || this.status == 304)
    {
        this.header.remove("Content-Type");
        return [this.status, this.header, []];
    }
    else
    {
        if (!this.header.includes("Content-Type"))
            this.header.set("Content-Type", this.length.toString(10));
        return [this.status, this.header, this];
    }
}

Jack.Response.prototype.each = function(callback) {
    this.body.each(callback);
    this.writer = callback;
    if (this.block)
        this.block(this);
}

Jack.Response.prototype.close = function() {
    if (this.body.close)
        this.body.close();
}