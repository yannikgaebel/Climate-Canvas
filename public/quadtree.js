class QuadtreeNode {
    constructor(bounds, maxPoints = 4) {
        this.bounds = bounds;
        this.maxPoints = maxPoints;
        this.points = [];
        this.nodes = [];
    }

    insert(point) {
        if (this.nodes.length !== 0) {
            const index = this.getIndex(point);

            if (index !== -1) {
                this.nodes[index].insert(point);
                return;
            }
        }

        this.points.push(point);

        if (this.points.length > this.maxPoints && this.nodes.length === 0) {
            this.subdivide();

            for (const p of this.points) {
                const index = this.getIndex(p);
                if (index !== -1) {
                    this.nodes[index].insert(p);
                }
            }

            this.points = [];
        }
    }

    subdivide() {
        const { x, y, width, height } = this.bounds;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        this.nodes.push(new QuadtreeNode({ x: x, y: y, width: halfWidth, height: halfHeight }, this.maxPoints));
        this.nodes.push(new QuadtreeNode({ x: x + halfWidth, y: y, width: halfWidth, height: halfHeight }, this.maxPoints));
        this.nodes.push(new QuadtreeNode({ x: x, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxPoints));
        this.nodes.push(new QuadtreeNode({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxPoints));
    }

    getIndex(point) {
        const { x, y, width, height } = this.bounds;
        const verticalMidpoint = x + width / 2;
        const horizontalMidpoint = y + height / 2;

        const inTopQuadrant = point.latitude <= horizontalMidpoint;
        const inBottomQuadrant = point.latitude >= horizontalMidpoint;
        const inLeftQuadrant = point.longitude <= verticalMidpoint;
        const inRightQuadrant = point.longitude >= verticalMidpoint;

        if (inTopQuadrant) {
            if (inLeftQuadrant) return 0;
            if (inRightQuadrant) return 1;
        } else if (inBottomQuadrant) {
            if (inLeftQuadrant) return 2;
            if (inRightQuadrant) return 3;
        }

        return -1;
    }

    queryRange(range, foundPoints) {
        if (!this.boundsOverlap(range)) {
            return;
        }

        for (const point of this.points) {
            if (this.pointInsideRange(point, range)) {
                foundPoints.push(point);
            }
        }

        for (const node of this.nodes) {
            node.queryRange(range, foundPoints);
        }
    }

    boundsOverlap(range) {
        return !(range.x + range.width < this.bounds.x || range.x > this.bounds.x + this.bounds.width ||
            range.y + range.height < this.bounds.y || range.y > this.bounds.y + this.bounds.height);
    }

    pointInsideRange(point, range) {
        return point.latitude >= range.y && point.latitude <= range.y + range.height &&
            point.longitude >= range.x && point.longitude <= range.x + range.width;
    }
}